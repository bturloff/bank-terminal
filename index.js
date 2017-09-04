var jsonfile = require('jsonfile'),
    userFile = 'users.json',
    readlineSync = require('readline-sync'),
    chalk = require('chalk')

// Clear the console function
console.reset = function () {
  return process.stdout.write('\033c');
}

//----------------- TTY COLORING -----------------------//

var colorMenuTitle = chalk.black.bold.bgYellow,
    colorWarning = chalk.bgRed.white,
    colorPrompt = chalk.gray.underline
  
//----------------------------- MAIN MENU ------------------------------//
var main = function(){
    var msg = "";
    while(true){
      console.reset();
      console.log(chalk.magenta("Welcome to the world's greatest banking ledger!\n\n"));
      if(msg.length > 0){
        console.log(chalk.blue(msg));
        msg = "";
      }
      console.log(colorMenuTitle('\nMAIN MENU'));
      var selected = readlineSync.keyInSelect(["Login", "Create Account"], "Select an option: ", {cancel: "Exit"});
      switch (selected){
          case 0:     login();
                      break;
          case 1:     msg = createAccount();
                      break;
          default:    console.log('\nGoodbye!\n');
                      process.exit();
                      break;                 
      }     
    }         
}

//----------------------------- LOGIN MENU ------------------------------//
var login = function(){
  var users = jsonfile.readFileSync(userFile);
  console.log(colorMenuTitle('LOGIN'));
  // Get username
  while(true){
      var username = readlineSync.question(chalk.gray.underline(' ([0] Main Menu) USERNAME ') + ' : ');
      if(username === '0'){
          return;
      }
      else if (!users[username]){
          console.log(colorWarning('Username entered does not exist!'));
      }
      else{
          break;
      }
  }
  // Get password
  while(true){
      var password = readlineSync.question(chalk.gray.underline(' PASSWORD ') + ' : ');
      if (password !== users[username].password){
          console.log(colorWarning('Invalid password!'));
      }
      else{
          console.reset();
          account(username);
          break;
      }
  }        
}

//----------------------------- ACCOUNT MENU ------------------------------//
var account = function(username){
    var users = jsonfile.readFileSync(userFile);
    var user = users[username];
    let exit = false;
    while(!exit){
        console.log(colorMenuTitle("\n\nWelcome, " + username));
        var selected = readlineSync.keyInSelect(["Check Balance", "Deposit", "Withdrawal", "Transaction History"], 
            "Select an option: ", {cancel: "LOGOUT"});
        switch(selected){
            case 0:     console.log('\nCurrent balance: ' + chalk.green( '$' + user.balance.toFixed(2) ));
                        break;
            case 1:     let deposit;
                        while(true){
                            deposit = parseFloat( readlineSync.questionFloat(chalk.gray.underline(' Enter AMOUNT to deposit ') + ' : $').
                                toFixed(2) );
                            if(deposit < 0){
                                console.log(colorWarning("Amount must be positive!"))
                            }
                            else{
                                break;
                            }
                        }                            
                        console.log("depositing: $" + deposit);
                        user.balance += deposit;
                        user.history.push({type: "deposit", amount: deposit});
                        jsonfile.writeFileSync(userFile, users, {spaces: 2}); 
                        break;
            case 2:     let withdrawal;
                        while(true){
                            withdrawal = parseFloat( readlineSync.questionFloat(chalk.gray.underline(' Enter AMOUNT to withdrawal ') + ' : $').
                                toFixed(2) );
                            if(withdrawal < 0){
                                console.log(colorWarning("Amount must be positive!"))
                            }
                            else if(user.balance - withdrawal < 0){
                              console.log(colorWarning("Insufficient funds"))
                            }
                            else{
                                break;
                            }
                        }                            
                        console.log("withdrawal: $" + withdrawal + " type: " + typeof withdrawal);
                        console.log('deposit variable: ' + withdrawal);                            
                        user.balance -= withdrawal;
                        user.history.push({type: "withdrawal", amount: withdrawal});
                        jsonfile.writeFileSync(userFile, users, {spaces: 2}); 
                        break;
            case 3:     console.log(chalk.underline('\nTransaction History:'));                
                        for(var transaction of user.history) {
                            var color = transaction.type === 'deposit' ? chalk.green : chalk.red; 
                            console.log(transaction.type + " " + color('$' + transaction.amount.toFixed(2)));
                        }
                        break;
            default:    exit = true;
            
        }
    }
}
    
//----------------------------- CREATE ACCOUNT MENU ------------------------------//
var createAccount = function() {
    var users = jsonfile.readFileSync(userFile)

    console.log(colorMenuTitle("CREATE ACCOUNT"));     
    // Get username       
    while(true){
        var username = readlineSync.question(chalk.gray.underline(' Enter USERNAME (at least 5 characters) ') + ' : ');
        if (users[username]){
            console.log(chalk.bgRed.white('Username already exists!'));
        }
        else if(username.length < 5){
            console.log(chalk.bgRed.white('Username length should be at least 5 characters'));
        }
        else {
            break;
        }              
    }           
    // Get password
    while(true){
        var password1 = readlineSync.question(chalk.gray.underline('Enter New PASSWORD (at least 5 characters) ') + ' : ');
        var password2 = readlineSync.question(chalk.gray.underline('Repeat PASSWORD: ')  + ' : ');
        if(password1 !== password2 ){
            console.log(chalk.bgRed.white("Passwords do not match!"));
        }
        else if(password1.length < 5){
            console.log(chalk.bgRed.white('Passwords length must be at least 5 characters'));
        }
        else{
            break;
        }                
    }
    users[username] = {password : password1, username: username, balance: 0.00, history: []};
    jsonfile.writeFileSync(userFile, users, {spaces: 2});  
    return username + "'s account was created";   
}



main();





