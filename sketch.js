// Bakeoff #3 - Escrita em Smartwatches
// IPM 2020-21, Semestre 2
// Entrega: até dia 4 de Junho às 23h59 através do Fenix
// Bake-off: durante os laboratórios da semana de 31 de Maio

// p5.js reference: https://p5js.org/reference/

// Database (CHANGE THESE!)
const GROUP_NUMBER   = 41;      // add your group number here as an integer (e.g., 2, 3)
const BAKE_OFF_DAY   = true;  // set to 'true' before sharing during the simulation and bake-off days
const CLICK_TIMEOUT = 0.6;     //in seconds
const NUMBER_SHOWN_LETTERS = 10;  //on-screen letters

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
let lastMenu = 0;
let timer = CLICK_TIMEOUT*1000  // in milliseconds
let nextChange;
let lastLetter = '';
let lastWord = '';

let wordsBank;
let predictedWord;


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

  wordsBank = loadStrings('parsedText.txt');
  predictedWord = '';
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
    fill(211); //:TODO Change this?
    rect(width/2 - 2.0*PPCM, height/2 - 2.0*PPCM, 4.0*PPCM, 1.0*PPCM);

    // Draws the touch input area (4x3cm) -- DO NOT CHANGE SIZE!
    stroke(0, 255, 0);
    fill(255, 255, 255);
    rect(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM);

    draw2Dkeyboard();       // draws our basic 2D keyboard UI

    drawUpperScreen();

    drawFatFinger();        // draws the finger that simulates the 'fat finger' problem
  }
}

// Draws 2D keyboard UI (current letter and left and right arrows)
function draw2Dkeyboard()
{
  drawMainGrid();
}

function drawMainGrid() {
  stroke(3);
  //Vertical guides
  line(width/2 - 1.0*PPCM, height/2 - 1.0*PPCM,
      width/2 - 1.0*PPCM, height/2 + 2.0*PPCM)

  line(width/2, height/2 - 1.0*PPCM,
      width/2, height/2 + 2.0*PPCM)

  line(width/2 + 1.0*PPCM, height/2,
      width/2 + 1.0*PPCM, height/2 + 2.0*PPCM)

  //Horizontal guides
  line(width/2 - 2.0*PPCM, height/2,
      width/2 + 2.0*PPCM, height/2)

  line(width/2 - 2.0*PPCM, height/2 + 1.0*PPCM,
      width/2 + 2.0*PPCM, height/2 + 1.0*PPCM)
  noStroke();

  textSize(14);
  fill(0, 0, 0); //defines the text color
  text('ABC', width/2 - 1.5*PPCM ,height/2 - 0.4*PPCM);
  text('DEF', width/2 - 0.5*PPCM ,height/2 - 0.4*PPCM);

  fill(0, 128, 0);
  text('Complete', width/2 + 1.0*PPCM ,height/2 - 0.4*PPCM);

  fill(0, 0, 0);
  text('GHI', width/2 - 1.5*PPCM ,height/2 + 0.6*PPCM);
  text('JKL', width/2 - 0.5*PPCM ,height/2 + 0.6*PPCM);
  text('MNO', width/2 + 0.5*PPCM ,height/2 + 0.6*PPCM);
  text('|__|', width/2 + 1.5*PPCM ,height/2 + 0.6*PPCM);

  text('PQRS', width/2 - 1.5*PPCM ,height/2 + 1.6*PPCM);
  text('TUV', width/2 - 0.5*PPCM ,height/2 + 1.6*PPCM);
  text('WXYZ', width/2 + 0.5*PPCM ,height/2 + 1.6*PPCM);
  text('<-', width/2 + 1.5*PPCM ,height/2 + 1.6*PPCM);
}

//Draws the non-interactive area
function drawUpperScreen() {
  if(lastWord !== '') {

    let predictedWords = wordsBank.filter((word) => word.startsWith(lastWord));

    if (predictedWords.length > 0) {
      if (lastWord === predictedWords[0])
        if(predictedWords.length > 1)
          predictedWord = predictedWords[1];
        else
          predictedWord = '';
      else
        predictedWord = predictedWords[0];
    }
    else predictedWord = '';
  }

  textSize(20);

  //If the word still fits in the screen
  if(lastWord.length < NUMBER_SHOWN_LETTERS) {
    let offset;

    if(predictedWord !== '') {
      if(predictedWord.length < NUMBER_SHOWN_LETTERS)
        offset = textWidth(predictedWord) / 2;
      else
        offset = textWidth(predictedWord.substring(0, NUMBER_SHOWN_LETTERS - 1)) / 2;
    }
    else
      offset = textWidth(lastWord) / 2;

    fill(0, 0, 0);
    if(predictedWord.length < NUMBER_SHOWN_LETTERS)
      text(predictedWord, width / 2, height / 2 - 1.3*PPCM);
    else
      text(predictedWord.substring(0, NUMBER_SHOWN_LETTERS - 1), width / 2, height / 2 - 1.3*PPCM);

    fill(0, 128, 0);
    textAlign(LEFT);
    text(lastWord, width/2 - offset, height / 2 - 1.3*PPCM);
    textAlign(CENTER);
  }
  else {
    /*
    let offset;
    if(predictedWord !== '') offset = textWidth(predictedWord.substring(predictedWord.length - NUMBER_SHOWN_LETTERS)) / 2;
    else                     offset = textWidth(lastWord.substring(lastWord.length - NUMBER_SHOWN_LETTERS)) / 2;

    let initialWidth = 0;


    for(let i = 0; i < NUMBER_SHOWN_LETTERS; i++) {
      textAlign(LEFT);
      fill(0, 0, 0);
      text(predictedWord[predictedWord.length - NUMBER_SHOWN_LETTERS + i], width / 2 - offset + initialWidth, height / 2 - 1.3*PPCM);
      fill(0, 128, 0);
      text(lastWord[lastWord.length - NUMBER_SHOWN_LETTERS + i], width / 2 - offset + initialWidth, height / 2 - 1.3*PPCM);
      textAlign(CENTER);

      if(predictedWord !== '')
        initialWidth += textWidth(predictedWord[predictedWord.length - NUMBER_SHOWN_LETTERS + i]);
      else
        initialWidth += textWidth(lastWord[lastWord.length - NUMBER_SHOWN_LETTERS + i]);


    }
     */
    let offset;
    //if(predictedWord !== '') offset = textWidth(predictedWord.substring(predictedWord.length - NUMBER_SHOWN_LETTERS)) / 2;
    if(predictedWord !== '') offset = textWidth(lastWord.substring(lastWord.length - int(NUMBER_SHOWN_LETTERS / 2)));
    else                     offset = textWidth(lastWord.substring(lastWord.length - NUMBER_SHOWN_LETTERS)) / 2;

    let initialWidth = 0;

    if(predictedWord !== '') {
      for (let i = 0; i < predictedWord.length; i++) {
        if(i > lastWord.length - int(NUMBER_SHOWN_LETTERS / 2) && i < lastWord.length + int(NUMBER_SHOWN_LETTERS / 2)) {
          //text(offset + initialWidth, width * 3/4, height / 2 - 1.3*PPCM);
          textAlign(LEFT);
          fill(0, 0, 0);
          text(predictedWord[i], width / 2 - offset + initialWidth, height / 2 - 1.3*PPCM);
          fill(0, 128, 0);
          text(lastWord[i], width / 2 - offset + initialWidth, height / 2 - 1.3*PPCM);
          textAlign(CENTER);

          initialWidth += textWidth(predictedWord[i]);
        }
      }
    }
    else {
      for(let i = 0; i < NUMBER_SHOWN_LETTERS; i++) {
        textAlign(LEFT);
        fill(0, 128, 0);
        text(lastWord[lastWord.length - NUMBER_SHOWN_LETTERS + i], width / 2 - offset + initialWidth, height / 2 - 1.3*PPCM);
        textAlign(CENTER);
        initialWidth += textWidth(lastWord[lastWord.length - NUMBER_SHOWN_LETTERS + i]);
      }
    }

  }
}

// Evoked when the mouse button was pressed
function mousePressed()
{
  // Only look for mouse presses during the actual test
  if (draw_finger_arm)
  {
    // Check if mouse click happened within the touch input area
    if(mouseClickWithin(width/2 - 2.0*PPCM, height/2 - 1.0*PPCM, 4.0*PPCM, 3.0*PPCM)) {
      let letters;

      // If the user clicks the ABC square
      if (mouseClickWithin(width / 2 - 2.0 * PPCM,
          height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
        letters = ['a', 'b', 'c'];
        checkSequentialClicks(letters,1);
      }
      //If the user clicks the DEF square
      else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
          height / 2 - 1.0 * PPCM, PPCM, PPCM)) {
        letters = ['d', 'e', 'f'];
        checkSequentialClicks(letters,2);
      }
      //If the user clicks the GHI square
      else if (mouseClickWithin(width / 2 - 2.0 * PPCM,
          height / 2, PPCM, PPCM)) {
        letters = ['g', 'h', 'i'];
        checkSequentialClicks(letters,3);
      }
      //If the user clicks the JKL square
      else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
          height / 2, PPCM, PPCM)) {
        letters = ['j', 'k', 'l'];
        checkSequentialClicks(letters,4);
      }
      //If the user clicks the MNO square
      else if (mouseClickWithin(width / 2,
          height / 2, PPCM, PPCM)) {
        letters = ['m', 'n', 'o'];
        checkSequentialClicks(letters,5);
      }
      //If the user clicks the PQRS square
      else if (mouseClickWithin(width / 2 - 2.0 * PPCM,
          height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
        letters = ['p', 'q', 'r', 's'];
        checkSequentialClicks(letters,6);
      }
      ////If the user clicks the TUV square
      else if (mouseClickWithin(width / 2 - 1.0 * PPCM,
          height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
        letters = ['t', 'u', 'v'];
        checkSequentialClicks(letters,7);
      }
      //If the user clicks the WXYZ square
      else if (mouseClickWithin(width / 2,
          height / 2 + 1.0 * PPCM, PPCM, PPCM)) {
        letters = ['w', 'x', 'y', 'z'];
        checkSequentialClicks(letters,8);
      }

      //If the user clicks auto-complete
      else if (mouseClickWithin(width / 2, height / 2 - 1.0 * PPCM,
          2.0 * PPCM, PPCM)) {
        currently_typed += predictedWord.substring(lastWord.length) + ' ';
        lastMenu = 0;
        lastWord = '';
        predictedWord = '';
      }

      //If the user clicks space
      else if (mouseClickWithin(width / 2 + 1.0 * PPCM, height / 2,
          2.0 * PPCM, PPCM)) {
        currently_typed += ' ';
        lastMenu = 0;
        lastWord = '';
        predictedWord = '';
      }

      //If the user clicks backspace
      else {
        currently_typed = currently_typed.substring(0, currently_typed.length - 1);
        lastWord = lastWord.substring(0, lastWord.length - 1);

        if(!currently_typed.endsWith(" ")) {
          let list = currently_typed.split(" ");
          lastWord = list[list.length - 1];
          predictedWord = lastWord;
        }
        lastMenu = 0;
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
        lastWord = "";
        predictedWord = "";
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
          currently_typed = "";
          lastWord = "";
          predictedWord = "";

          second_attempt_button = createButton('START 2ND ATTEMPT');
          second_attempt_button.mouseReleased(startSecondAttempt);
          second_attempt_button.position(width/2 - second_attempt_button.size().width/2, height/2 + 220);
        }
      }
    }
  }
}

function checkSequentialClicks(letters, currentMenu) {
  //If the menu selected earlier was this one
  if(lastMenu === currentMenu && millis() <= nextChange) {
      currently_typed = currently_typed.substring(0, currently_typed.length - 1);
      currently_typed += letters[(letters.indexOf(lastLetter) + 1) % letters.length];

      lastWord = lastWord.substring(0, lastWord.length - 1);
      lastWord += letters[(letters.indexOf(lastLetter) + 1) % letters.length];

      lastLetter = letters[(letters.indexOf(lastLetter) + 1) % letters.length];
  }
  else {
    currently_typed += letters[0];
    lastWord += letters[0];
    lastLetter = letters[0];
    lastMenu = currentMenu;
  }
  nextChange = millis() + timer;
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
  let CPS              = (wpm * 5.0) / 60;
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
  text("CPS : " + CPS.toFixed(2), width / 2, height / 2 + h+100);

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