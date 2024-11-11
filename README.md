# Simple Tinder-Like
## Project Details
The project consists of three services written in a monolithic architecture:
1. Auth service: contains the logic to register a new user and returns the JWT required for authentication purposes.
2. User service: contains the logic to CRUD users' profiles.
3. Match service: contains the logic to CRUD matches based on users' interests using a scoring system.

Details on how the matching service works
- Users can only get potential matches with other users once they have set their profile's interests, gender, and gender preference
- Users that have not upgraded their profile will only be able to do a swipe + pass actions for a total of 10 times per day
- Users can only upgrade their profile once their subscription has expired. Upgrades will always give a subscription of 30 days.
- Users will be given potential matches that have similar scores.
- Scores are given based on the interests the users have selected
- Currently, the interests allowed for users are listed below:
	- `['wineTasting', 'beerBrewing', 'fashion', 'gardening', 'carRestoration', 'homeBrewing', 'beerTasting', 'cookingClasses', 'artClasses', 'hiking', 'surfing', 'snowboarding', 'skiing', 'fishing', 'hunting', 'kayaking', 'canoeing', 'scubaDiving', 'snorkeling', 'rockClimbing', 'camping', 'backpacking', 'urbanExploration', 'photography', 'painting', 'drawing', 'crafting', 'knitting', 'sewing', 'woodworking', 'writing', 'poetry', 'acting', 'standUpComedy', 'magicTricks', 'cosplay', 'modelBuilding', 'aquariumKeeping', 'bonsaiTrees', 'trampolining', 'reading', 'blogging', 'vlogging', 'puzzleSolving', 'languageLearning', 'cultureExploration', 'history', 'philosophy', 'science', 'technology', 'robotics', 'coding', 'investing', 'entrepreneurship', 'astronomy', 'astrology', 'puzzleSolving', 'movies', 'music', 'dancing', 'fitness', 'yoga', 'playingInstruments', 'singing', 'sports', 'basketball', 'soccer', 'football', 'baseball', 'tennis', 'golf', 'bowling', 'martialArts', 'fencing', 'archery', 'boardGames', 'cardGames', 'foodFestivals', 'musicFestivals', 'comicConventions', 'rollerblading', 'iceSkating', 'parkour']`

Tests are in the following Postman collection: https://www.postman.com/richard-here/workspace/simple-tinder-like/request/12531688-80a88a2a-b8d0-4b8f-b1b4-c7d37a57df30?action=share&creator=12531688&ctx=documentation&active-environment=12531688-b316533c-6e15-4110-a8b4-5a04f736a093

## How to run and test the service
1. Clone the Github to your local machine
2. Run `npm install`, then `npm run build:watch`. The Express app will be served at `http://127.0.0.1:3000`
3. Go to the Postman collection listed above
4. Register an account with an email and password
5. Login using the email and password (the ID token will be given and saved into the Postman's environmental variables)
6. Update your profile with the interests listed above, your gender, and your gender preference
7. Get potential matches
8. Using one of the potential matches' ID, send an `accepted` status (or `declined` to decline)
9. Login using the email of your potential match's email with the password `12345678` (all dummy users are populated with this same password)
10. Accepts the match using the newly obtained ID token after logging in
11. Login using your registered account
12. Get accepted matches
13. Get more potential matches (you should see that there will be 1 new potential match)
14. Accepts/decline matches until 10 times until you hit the limit
15. Using the same ID token, mark your own account as paid
16. Now you can accept/decline 10 additional matches (20/day total)