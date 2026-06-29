Web3 Literacy Hub & Referral Logic (Beta Phase)

Project Overview:
This repository contains the original JavaScript/Velo source code from the first beta concept phase of my Web3 Literacy platform. The goal was to build a working system that could handle user signups, keep track of who referred who, produce referrer linked data to the right person, check if someone paid for a subscription, display rewards based on their progress, and a premium referral access system. The base concept - to educate the public on web3, blockchain and crypto, with a premium referral model to generate income. This has now been stripped back, and is a streamlined, jargon and hype free civic digital literacy hub.

This was the very first time I had written code or designed database systems. I used AI tools to help me structure the scripts, and spent months troubleshooting and figuring out why things didn't work, learned the system logic and parameters within different scripting environments, and work out how to make everything work as I wanted it to. 

The repository is kept as it ran in the final beta production - it's a baseline record of my logical thinking and problem-solving before I moved into formal cybersecurity training.


System Directory Structure:

├── 📁 backend/
│   ├── 📄 events.js                # Automatically runs when someone pays or signs up
│   ├── 📄 jobs.config              # Sets the timer for the database cleanup script
│   ├── 📄 jobs.js                  # Cleans out old temporary tracking data
│   ├── 📄 piCode.web.js            # Checks if a link belongs to an active subscriber
│   └── 📄 referrerData.web.js      # Looks up who invited the logged-in user
├── 📁 frontend/
│   ├── 📄 ReferralLandingPage.js   # Analyse and grab incoming URL, popup displays based on security status
│   ├── 📄 CustomSignupLightbox.js  # Grabs email and local memory URL in cms
│   ├── 📄 CurrencyConverterPage.js # Converts prices to different currencies using a live API
│   ├── 📄 ErrorLightbox.js         # A popup box that displays a clean error message on landing page
│   ├── 📄 GrowYourVisionPage.js    # The user dashboard tracking referral points and ranks
│   ├── 📄 LearnMorePage.js         # Lets users manually paste in a referral link safely
│   ├── 📄 PiCodeLookup.js          # Connects temporary landing data to permanent profiles
│   └── 📄 RankAndRewardsPage.js    # Displays different badges depending on user points
└── 📄 LICENSE                      # Copyright notice to protect the code


Functional Architecture & Module Breakdown:

1. Backend Scripts (📁 backend/)
- events.js: This listens for automatic web events. When a new member signs up, it sets up a fresh blank data row for them. When someone buys a pass, it automatically changes their status to Active and adds a referral point to the person who invited them.

- jobs.config & jobs.js: This handles automated maintenance. Every time someone clicks a link, it creates temporary tracking data. To stop the database from getting slow and bloated, this script is configured to run automatically at midnight once a month to delete tracking data older than six months. This also aligns with data privacy concepts like GDPR by not keeping data forever.

- piCode.web.js: This acts as a security gate. When someone arrives via a referral link, this script looks up the person who sent the link. If that person hasn't paid or their subscription is inactive, it stops the script and sends back an error.

- referrerData.web.js: This runs safely on the server side. It checks who the logged-in user is, looks at the database, finds the person who invited them, and fetches their name and invite details.


2. Frontend Scripts (📁 frontend/)
- ReferralLandingPage.js: When a visitor clicks a referral link, this script reads the long URL, cleans it up, strips out the web protocols, and saves the unique referral code into the user's browser memory so the site remembers who sent them. It checks the owner of the referrals subscription status. If they aren't an active subscriber, a pop-up is activated to block sign-up & offers solutions.

- CustomSignupLightbox.js: This runs inside the signup popup box. When a new user types their email address to join, it pulls the referral code we saved in the browser memory and binds them together in a temporary database table.

- CurrencyConverterPage.js: This connects to a live, external network to get real-time exchange rates. It strips away text symbols (like turning £100 into 100), does the multiplication math, and changes the price on the page depending on what currency the user selects from a dropdown.

- ErrorLightbox.js: An error popup on landing page to stop anyone being able to sign up with an unknown referral format, to maintain integrity. 

- GrowYourVisionPage.js & RankAndRewardsPage.js: These pull the user's points balance from a loyalty system. It contains logic to read what tier they are, changes the rank image on screen. Fills out a random text template with their unique link so they can easily share it on social media, generate QR code specific to them, and grab their unique ceferral link when they navigate to a store page for later input. 

- LearnMorePage.js: If someone didn't arrive via a link, or explored the site, they could paste a referral link into a box manually. The script checks that the pasted text actually matches the correct website domain before redirecting them, preventing users from being sent to fake links. Showed real-time Cryptocurrency prices using external API.

- PiCodeLookup.js: This runs inside the educational course. When a student gets to the part of the course where they join the external site, this script looks up their email address, checks who referred them, verifies that person has a paid subscription, and then safely shows the correct invite code.

- ReferralAdminOverview.js: This was an internal admin page I built to track how the site was performing. It stops standard users from entering, calculates the overall conversion rates of signups, splits users into performance brackets, and updates an interactive sorting table.


What I Learned About Security:

Building this project was a huge learning experience. Now that I am studying formal cybersecurity, I can look back at my beta code and see wheat areas need improvements.

- Frontend: I allowed frontend scripts to update the database directly using overrides (suppressAuth: true). I now know that malicious users can alter frontend code inside their browser console. In a professional system, all database updates must be moved to secure backend files where users cannot touch them.
- Hide Detailed Errors: My code passed highly specific error messages back to the website screen (like "No MemberData record found"). While this made debugging easy for me, it tells an attacker exactly how my database is structured. It is much more secure to display a generic message like "An error occurred" to the public, while keeping the technical details hidden inside server logs.
- Input Validation: My scripts checked text boxes using simple commands like .includes(). To prevent hackers from submitting malicious scripts or trying to inject code into forms, all inputs should be sanitized using strict pattern-matching masks (Regular Expressions) before the data touches a database.

The system worked as intended through the beta, but after deliberation, decided that the site and concept wasn't aligning with the original core intention. The tracking, referral and gamified framework has since been removed from the live platform. The live version is now a straightforward, jargon-free civic literacy tool.




transitioned into a highly streamlined, jargon-free civic literacy engine.
