// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 41;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = false;  // set to 'true' before sharing during the simulation and bake-off days

let PPI, PPCM;                 // pixel density (DO NOT CHANGE!)
let second_attempt_button;     // button that starts the second attempt (DO NOT CHANGE!)

// Finger parameters (DO NOT CHANGE!)
let finger_img;                // holds our finger image that simules the 'fat finger' problem
let FINGER_SIZE, FINGER_OFFSET;// finger size and cursor offsett (calculated after entering fullscreen)

// Arm parameters (DO NOT CHANGE!)
let arm_img;                   // holds our arm/watch image
let ARM_LENGTH, ARM_HEIGHT;    // arm size and position (calculated after entering fullscreen)

// Study control parameters (DO NOT CHANGE!)
let draw_finger_arm  = false;  // used to control what to show in draw()
let phrases          = [];     // contains all 501 phrases that can be asked of the user
let current_trial    = 0;      // the current trial out of 2 phrases (indexes into phrases array above)
let attempt          = 0       // the current attempt out of 2 (to account for practice)
let target_phrase    = "";     // the current target phrase
let currently_typed  = "";     // what the user has typed so far
let entered          = new Array(2); // array to store the result of the two trials (i.e., the two phrases entered in one attempt)
let CPS              = 0;      // add the characters per second (CPS) here (once for every attempt)

// Metrics
let attempt_start_time, attempt_end_time; // attemps start and end times (includes both trials)
let trial_end_time;            // the timestamp of when the lastest trial was completed
let letters_entered  = 0;      // running number of letters entered (for final WPM computation)
let letters_expected = 0;      // running number of letters expected (from target phrase)
let errors           = 0;      // a running total of the number of errors (when hitting 'ACCEPT')
let database;                  // Firebase DB

// 2D Keyboard UI
let leftArrow, rightArrow;     // holds the left and right UI images for our basic 2D keyboard   
let ARROW_SIZE;                // UI button size
let current_letter = 'a';      // current char being displayed on our basic 2D keyboard (starts with 'a')

let letters_menu;
let letters_submenu;

let submenu_opened = false;
let submenu1 = false;
let submenu2 = false;
let submenu3 = false;
let submenu4 = false;
let submenu5 = false;
let submenu6 = false;
let submenu7 = false;
let submenu8 = false;
let submenu9 = false;

let submenu = 0;


// Runs once before the setup() and loads our data (images, phrases)
function preload()
{    
  // Loads simulation images (arm, finger) -- DO NOT CHANGE!
  arm = loadImage("data/arm_watch.png");
  fingerOcclusion = loadImage("data/finger.png");
    
  // Loads the target phrases (DO NOT CHANGE!)
  phrases = loadStrings("data/phrases.txt");
  
  // Loads UI elements for our basic keyboard
  leftArrow = loadImage("data/left.png");
  rightArrow = loadImage("data/right.png");
}

// Runs once at the start
function setup()
{
  createCanvas(700, 500);   // window size in px before we go into fullScreen()
  frameRate(60);            // frame rate (DO NOT CHANGE!)
  
  // DO NOT CHANGE THESE!
  shuffle(phrases, true);   // randomize the order of the phrases list (N=501)
  target_phrase = phrases[current_trial];
  
  drawUserIDScreen();       // draws the user input screen (student number and display size)
}

function draw()
{ 
  if(draw_finger_arm)
  {
    //Supporting elements -- not change
    background(255);           // clear background
    noCursor();                // hides the cursor to simulate the 'fat finger'
    
    drawArmAndWatch();         // draws arm and watch background
    writeTargetAndEntered();   // writes the target and entered phrases above the watch
    drawACCEPT();              // draws the 'ACCEPT' button that submits a phrase and completes a trial
    
    // Draws the non-interactive screen area (4x1cm) -- DO NOT CHANGE SIZE!
    noStroke();
    fill(125);
    rect(width/2 - 2.0*PPCM, height/2 - 2.0*PPCM, 4.0*PPCM, 1.0*PPCM);
    textAlign(CENTER); 
    textFont("Arial", 16);
    fill(0);
    text("NOT INTERACTIVE", width/2, height/2 - 1.3 * PPCM);

    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    stroke(0, 255, 0);
    noFill();
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM);

    draw2Dkeyboard();       // draws our basic 2D keyboard UI

    drawFatFinger();        // draws the finger that simulates the 'fat finger' problem
  }
}

// Draws 2D keyboard UI (current letter and left and right arrows)
function draw2Dkeyboard()
{
  drawMainGrid();

  if(submenu_opened) drawSubMenu();
}

function drawMainGrid() {
  stroke(3);
  line(width/2 - 1.0*PPCM, height/2 - 1.0*PPCM,
      width/2 - 1.0*PPCM, height/2 + 2.0*PPCM)

  line(width/2, height/2 - 1.0*PPCM,
      width/2, height/2 + 2.0*PPCM)

  line(width/2 + 1.0*PPCM, height/2 - 1.0*PPCM,
      width/2 + 1.0*PPCM, height/2 + 2.0*PPCM)

  line(width/2 - 2.0*PPCM, height/2 ,
      width/2 + 2.0*PPCM, height/2)

  line(width/2 - 2.0*PPCM, height/2 + 1.0*PPCM,
      width/2 + 2.0*PPCM, height/2 + 1.0*PPCM)
  noStroke();

  textSize(14);
  fill(0, 0, 0); //defines the text color
  text('ABC', width/2 - 1.5*PPCM ,height/2 - 0.4*PPCM);
  text('DEF', width/2 - 0.5*PPCM ,height/2 - 0.4*PPCM);
  text('GHI', width/2 + 0.5*PPCM ,height/2 - 0.4*PPCM);
  text('<-', width/2 + 1.5*PPCM ,height/2 - 0.4*PPCM);

  text('JKL', width/2 - 1.5*PPCM ,height/2 + 0.6*PPCM);
  text('MNO', width/2 - 0.5*PPCM ,height/2 + 0.6*PPCM);
  text('PQR', width/2 + 0.5*PPCM ,height/2 + 0.6*PPCM);
  text('\'', width/2 + 1.5*PPCM ,height/2 + 0.6*PPCM);

  text('STU', width/2 - 1.5*PPCM ,height/2 + 1.6*PPCM);
  text('VWX', width/2 - 0.5*PPCM ,height/2 + 1.6*PPCM);
  text('YZ', width/2 + 0.5*PPCM ,height/2 + 1.6*PPCM);
  text('-___-', width/2 + 1.5*PPCM ,height/2 + 1.6*PPCM);
}

function drawSubMenu() {
  //Draws the new "canvas"
  stroke(2);
  fill(255, 255, 255);
  rect(width/2 - 1.75*PPCM, height/2 - 0.75*PPCM, 3.5*PPCM, 2.5*PPCM);
  noStroke();

  //Draws the guidelines
  fill(0, 0, 0);
  stroke(2);
  line(width/2 - 1.75*PPCM, height/2 + 0.5*PPCM,
      width/2 + 1.75*PPCM, height/2 + 0.5*PPCM )

  line(width/2 - 0.58*PPCM, height/2 - 0.75*PPCM,
      width/2 - 0.58*PPCM, height/2 + 0.5*PPCM )

  line(width/2 + 0.58*PPCM, height/2 - 0.75*PPCM,
      width/2 + 0.58*PPCM, height/2 + 0.5*PPCM )
  noStroke();


  //Draws the cancel "button"
  textSize(18);
  fill(0, 0, 0);
  text('Cancel', width/2, height/2 + 1.225*PPCM);

  switch (submenu) {
    case 1: {
      letters_menu = ['A', 'B', 'C'];
      letters_submenu = ['a', 'b', 'c'];
      break;
    }
    case 2: {
      letters_menu = ['D', 'E', 'F'];
      letters_submenu = ['d', 'e', 'f'];
      break;
    }
    case 3: {
      letters_menu = ['G', 'H', 'I'];
      letters_submenu = ['g', 'h', 'i'];
      break;
    }
    case 4: {
      letters_menu = ['J', 'K', 'L'];
      letters_submenu = ['j', 'k', 'l'];
      break;
    }
    case 5: {
      letters_menu = ['M', 'N', 'O'];
      letters_submenu = ['m', 'n', 'o'];
      break;
    }
    case 6: {
      letters_menu = ['P', 'Q', 'R'];
      letters_submenu = ['p', 'q', 'r'];
      break;
    }
    case 7: {
      letters_menu = ['S', 'T', 'U'];
      letters_submenu = ['s', 't', 'u'];
      break;
    }
    case 8: {
      letters_menu = ['V', 'W', 'X'];
      letters_submenu = ['v', 'w', 'x'];
      break;
    }
    case 9: {
      letters_menu = ['Y', '', 'Z'];
      letters_submenu = ['y', '', 'z'];
      break;
    }
    default:
      break;
  }

  text(letters_menu[0], width/2 - 1.165*PPCM, height/2);
  text(letters_menu[1], width/2, height/2);
  text(letters_menu[2], width/2 + 1.165*PPCM, height/2);
}
// Evoked when the mouse button was pressed
function mousePressed()
{
  // Only look for mouse presses during the actual test
  if (draw_finger_arm)
  {                   
    // Check if mouse click happened within the touch input area
    if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM))  
    {
      textSize(14);
      //If the user is in the main screen
      if(!submenu_opened) {
        if (mouseClickWithin(width / 2 - 2.0 * PPCM,
            height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 1
          submenu_opened = true;
          submenu = 1;

        }
        else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
            height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 2
          submenu_opened = true;
          submenu = 2;

        }
        else if (mouseClickWithin(width / 2,
            height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 3
          submenu_opened = true;
          submenu = 3;


        }
        //If the user clicks on the backspace
        else if (mouseClickWithin(width / 2 + 1.0 * PPCM,
            height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
          currently_typed = currently_typed.substring(0, currently_typed.length - 1);
        }
        else if (mouseClickWithin(width / 2 - 2.0 * PPCM,
            height / 2, PPCM, PPCM)) {
          //open submenu 4
          submenu_opened = true;
          submenu = 4;

        }
        else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
            height / 2, PPCM, PPCM)) {
          //open submenu 5
          submenu_opened = true;
          submenu = 5;

        }
        else if (mouseClickWithin(width / 2,
            height / 2, PPCM, PPCM)) {
          //open submenu 6
          submenu_opened = true;
          submenu = 6;

        }
        //If the user clicks '
        else if (mouseClickWithin(width / 2 + 1.0 * PPCM,
            height / 2, PPCM, PPCM)) {
          currently_typed += '\'';

        }
        else if (mouseClickWithin(width / 2 - 2.0 * PPCM,
            height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 7
          submenu_opened = true;
          submenu = 7;

        }
        else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
            height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 8
          submenu_opened = true;
          submenu = 8;

        }
        else if (mouseClickWithin(width / 2,
            height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
          //open submenu 9
          submenu_opened = true;
          submenu = 9;

        }
        //If the user clicks the space
        else if (mouseClickWithin(width / 2 + 1.0 * PPCM,
            height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
          if(currently_typed.length > 0)
            currently_typed += ' ';
        }
      }
      //If the user is in one of the submenus
      else {
        //If the user clicks in the submenu
        if(mouseClickWithin(width/2 - 1.75*PPCM, height/2 - 0.75*PPCM, 3.5*PPCM, 2.5*PPCM)) {
          //if the user is clicking the cancel button
          if(mouseClickWithin(width/2 - 1.75*PPCM, height/2 + 0.5*PPCM, 3.5*PPCM, 1.25*PPCM)) {
            submenu = 0;
            submenu_opened = false;
          }
          //if the user clicks in the first upper square
          else if (mouseClickWithin(width/2 - 1.75*PPCM, height/2 - 0.75*PPCM, 1.17*PPCM, 1.25*PPCM)) {
            currently_typed += letters_submenu[0];
          }
          //if the user clicks in the second upper square
          else if (mouseClickWithin(width/2 - 0.58*PPCM, height/2 - 0.75*PPCM, 1.16*PPCM, 1.25*PPCM)) {
            if(submenu !== 9)
              currently_typed += letters_submenu[1];
          }
          //if the user clicks in the third upper square
          else if (mouseClickWithin(width/2 + 0.58*PPCM, height/2 - 0.75*PPCM, 1.17*PPCM, 1.25*PPCM)) {
            currently_typed += letters_submenu[2];
          }
        }
      }
    }
    
    // Check if mouse click happened within 'ACCEPT' 
    // (i.e., submits a phrase and completes a trial)
    else if (mouseClickWithin(width/2 - 2*PPCM, height/2 - 5.1*PPCM, 4.0*PPCM, 2.0*PPCM))
    {
      // Saves metrics for the current trial
      letters_expected += target_phrase.trim().length;
      letters_entered += currently_typed.trim().length;
      errors += computeLevenshteinDistance(currently_typed.trim(), target_phrase.trim());
      entered[current_trial] = currently_typed;
      trial_end_time = millis();

      current_trial++;

      // Check if the user has one more trial/phrase to go
      if (current_trial < 2)                                           
      {
        // Prepares for new trial
        currently_typed = "";
        target_phrase = phrases[current_trial];  
      }
      else
      {
        // The user has completed both phrases for one attempt
        draw_finger_arm = false;
        attempt_end_time = millis();
        
        printAndSavePerformance();        // prints the user's results on-screen and sends these to the DB
        attempt++;

        // Check if the user is about to start their second attempt
        if (attempt < 2)
        {
          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 200);
        }
      }
    }
  }
}

// Resets variables for second attempt
function startSecondAttempt()
{
  // Re-randomize the trial order (DO NOT CHANG THESE!)
  shuffle(phrases, true);
  current_trial        = 0;
  target_phrase        = phrases[current_trial];
  
  // Resets performance variables (DO NOT CHANG THESE!)
  letters_expected     = 0;
  letters_entered      = 0;
  errors               = 0;
  currently_typed      = "";
  CPS                  = 0;
  
  current_letter       = 'a';
  
  // Show the watch and keyboard again
  second_attempt_button.remove();
  draw_finger_arm      = true;
  attempt_start_time   = millis();  
}

// Print and save results at the end of 2 trials
function printAndSavePerformance()
{
  // DO NOT CHANGE THESE
  let attempt_duration = (attempt_end_time - attempt_start_time) / 60000;          // 60K is number of milliseconds in minute
  let wpm              = (letters_entered / 5.0) / attempt_duration;      
  let freebie_errors   = letters_expected * 0.05;                                  // no penalty if errors are under 5% of chars
  let penalty          = max(0, (errors - freebie_errors) / attempt_duration); 
  let wpm_w_penalty    = max((wpm - penalty),0);                                   // minus because higher WPM is better: NET WPM
  let timestamp        = day() + "/" + month() + "/" + year() + "  " + hour() + ":" + minute() + ":" + second();
  
  background(color(0,0,0));    // clears screen
  cursor();                    // shows the cursor again
  
  textFont("Arial", 16);       // sets the font to Arial size 16
  fill(color(255,255,255));    //set text fill color to white
  text(timestamp, 100, 20);    // display time on screen 
  
  text("Finished attempt " + (attempt + 1) + " out of 2!", width / 2, height / 2); 
  
  // For each trial/phrase
  let h = 20;
  for(i = 0; i < 2; i++, h += 40 ) 
  {
    text("Target phrase " + (i+1) + ": " + phrases[i], width / 2, height / 2 + h);
    text("User typed " + (i+1) + ": " + entered[i], width / 2, height / 2 + h+20);
  }
  
  text("Raw WPM: " + wpm.toFixed(2), width / 2, height / 2 + h+20);
  text("Freebie errors: " + freebie_errors.toFixed(2), width / 2, height / 2 + h+40);
  text("Penalty: " + penalty.toFixed(2), width / 2, height / 2 + h+60);
  text("WPM with penalty: " + wpm_w_penalty.toFixed(2), width / 2, height / 2 + h+80);

  // Saves results (DO NOT CHANGE!)
  let attempt_data = 
  {
        project_from:         GROUP_NUMBER,
        assessed_by:          student_ID,
        attempt_completed_by: timestamp,
        attempt:              attempt,
        attempt_duration:     attempt_duration,
        raw_wpm:              wpm,      
        freebie_errors:       freebie_errors,
        penalty:              penalty,
        wpm_w_penalty:        wpm_w_penalty,
        cps:                  CPS
  }
  
  // Send data to DB (DO NOT CHANGE!)
  if (BAKE_OFF_DAY)
  {
    // Access the Firebase DB
    if (attempt === 0)
    {
      firebase.initializeApp(firebaseConfig);
      database = firebase.database();
    }
    
    // Add user performance results
    let db_ref = database.ref('G' + GROUP_NUMBER);
    db_ref.push(attempt_data);
  }
}

// Is invoked when the canvas is resized (e.g., when we go fullscreen)
function windowResized()
{
  resizeCanvas(windowWidth, windowHeight);
  let display    = new Display({ diagonal: display_size }, window.screen);
  
  // DO NO CHANGE THESE!
  PPI           = display.ppi;                        // calculates pixels per inch
  PPCM          = PPI / 2.54;                         // calculates pixels per cm
  FINGER_SIZE   = (int)(11   * PPCM);
  FINGER_OFFSET = (int)(0.8  * PPCM)
  ARM_LENGTH    = (int)(19   * PPCM);
  ARM_HEIGHT    = (int)(11.2 * PPCM);
  
  ARROW_SIZE    = (int)(2.2 * PPCM);
  
  // Starts drawing the watch immediately after we go fullscreen (DO NO CHANGE THIS!)
  draw_finger_arm = true;
  attempt_start_time = millis();
}