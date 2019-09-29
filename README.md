# [routekey.me](http://routekey.me)
A url-shortener service for Albany High School

Using vue.js frontend and express.js / mongo
## Why go through the trouble?
Mr. Morris got tired of using yellkey and shoutkey (rest in peace you will not be forgotten).
This app takes inspiration from yellkey and shoutkey but instead uses the following sets of words / phrases as slugs for shortened urls:
- Morris's colloquialisms (henceforth "Morissisms")
- Inside jokes from AHS (i.e. The Trifecta of the Third floor)
- Computer science related terms (algorithms, babbage, callback etc)
- Cool Ocean Science terms (abyssal, bathymetry, caballing, etc)
- Cool sounding words (aubergine, burgundy, charcuterie, etc)

## Admin tools
Additional admin tools are accessible with an `ausdk12.org` staff email (login w/ Oauth) 
- Allows teachers / administration to generate their own custom phrases for shortnended urls
- Allows admin to add new cool words (!) to the database
- Displays live feeds of which routekeys are in use
- Displays static table of what's in the routekey database
