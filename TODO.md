# Fanatasy Chadminton Simulation

## TO DO

### Backend

* Add fatigue system to game simulation
  * The more contests a player participates in, the more their stats are adversely affected (based on their stamina)
* Write function to generate a schedule
  * 64 teams, 8 division of 8 teams
  * play every team in your division 2 times = 7 * 2 = 14 games (14)
  * play every team in your sister division 1 time = 8 games (22)
  * play every team in another rotating division 1 team = 8 games (30)
  * top 16 teams make the playoffs
  * every round is best of 5 games
* Add code to run daily simulation
* Add player injury system
  * No signing new players while you have injured players
* Add trading system
* Link players/teams/games/stats/injuries to a database
* Add season advance logic
  * Players retiring (based on age, injuries)
    * set `retired = currentSeason` so we know when they retired
  * Advance all player ages +1 year
  * Adjust all player attributes (based on age and stats + random)
  * `currentSeason++`
  * New players (18-23 yrs old)
    * generate # of players that retired x 1.1
    * set `rookieSeason = currentSeason`
  * Draft new players
  * Release players
  * Free Agent signings (maybe a few rounds of releases and Free Agent signings?)

  ### Frontend

  * Build UI
  * Home Page
    * Recap of yesterday's games
    * Preview of today's games
  * Standings
    * Entire League
    * By Division
  * Playoff Bracket (when playoffs)
  * Stats
  * Team Page
    * With schedule
  * Player Page
    * Random photo generator
  * Offseason Results