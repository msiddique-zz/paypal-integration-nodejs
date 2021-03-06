# Connect to Paypal using Node JS Sdk

# How to use

## 1- Make a paypal developer account
Go to `https://developer.paypal.com/developer/accounts/` and click on 'Login to Dashboard Button'<br />
Sign up the form to create paypal developer account<br /><br />

## 2- Make Paypal Sandbox Test Accounts
Go to Sandbox tab located on left side and click on 'Accounts'<br />
Click on 'Create Account' button.<br />
Make two accounts. One of 'Personal' type and one of 'Business' type.<br /><br />


## 3- Create Developer App 
Go to 'My Apps and Credentials' tab located in dashboard panel on left side.<br />
Click on 'Create App' and fill up the forms to create app<br />

## 4- Get App's credentials
 Copy 'Client ID' & 'Secret' of your app<br /><br />

## 5- Clone github repository 
Clone this repository and open code in editor<br />
First rename '.env-sample' file to '.env'<br />
Now paste your 'Client ID' and 'Secret' in this file<br />
Also paste your mysql database credentials in this file<br /><br />

## 6 - Run the migrations
Run this command to migrate database

```
npx sequelize-cli db:migrate
```

## 7- Download ngrok
Go to `https://ngrok.com/download` and downlaod ngrok in your local storage<br />
After downloading ,open the ngrok.exe and execute this command<br /><br />

```
ngrok http 3000
```

## 8- Hook the developer App
Copy the 'https' Forwarding Link from ngrok shell <br />
Now go to developer app which you created on Paypal<br />
In 'Sanbox Webhooks' section, click on 'Add Webhook' button<br />
Paste ngrok's URL in 'Webhook URL' field.<br />
Choose "Billing Plan Created", "Billing Plan Updated", "Billing Subscription Created" , "Payment Sale Created"<br />
Click on 'Save' button<br /><br />

## 9- Run the code
Now go to editor's terminal and run these code lines one by one<br/><br/>

```
npm install
node app.js
```

## 10- Open into browser
Open a browser and go to `http://localhost:3000/`.<br />
You can now buy an item and subscribe too.<br />
Click on 'Buy' or 'Subscribe' button and login with 'personal' type sandbox account.<br />
It will make payment with Paypal . Yayyyyyy<br />