[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/diragb/SagittariusAStar/blob/master/LICENSE)
[![GitHub version](https://badge.fury.io/gh/Naereen%2FStrapDown.js.svg)](https://github.com/diragb/SagittariusAStar/blob/master/SagittariusAStar.js)
[![HitCount](http://hits.dwyl.io/Naereen/hits.svg)](https://github.com/diragb/SagittariusAStar/blob/master/SagittariusAStar.js)

# SagittariusAStar
<b>Named after a <a href="https://upload.wikimedia.org/wikipedia/commons/9/9f/Sagittarius_A%2A_black_hole_simulation.png">black hole</a>, works like it.</b>

Scrapes results from the <a href="http://cbseresults.nic.in/class12/Class12th19.htm">CBSE results website</a>, however the School no., Center no., and base Admid (or end-points) should be known.


## Dependencies
Requires a <a href="https://nodejs.org">Node.js</a> environment to work, along with <a href="https://developers.google.com/web/tools/puppeteer/">Puppeteer</a> (requires <a href="https://www.npmjs.com/get-npm">NPM</a>) and <a href="https://download-chromium.appspot.com/">Chromium</a>.
Also requires a laptop that doesn't melt, unlike mine (Chromium's Blink and V8 puts a big pressure on the CPU for page rendering, I guess).


## Working
<b>Improve this if you're a bigger hotshot than me.</b>

Assumes that roll numbers are ordered alphabetically, loops through 26<sup>2</sup> probable admids in the WCS, which takes place only when a new class partition starts.
Sends a minimum of 5 GET requests/second to the server, may overload and crash the server if many people do this, however. I must also note that this <b>may</b> be borderline illegal.

Anyway, on navigation to results page, it checks the width of the 4th table on the page. If favorable, runs a loop and scrapes all details from the table, then prepares a JSON string and appends it to the end of the CBSEResults.json file.


## Issues

Oh well, let's get to the issues:
1. It's restricted to only one school.
2. Slow internet may cause the DNS lookup to fail, causing the code to puke on itself.
3. Saved CBSEResults.json doesn't have a closing bracket, I mean, deal with it.. I guess? <b>Or open an issue and fix it without affecting the speed and efficiency.</b>
4. Cannot run headless, at least on my machine. I've looked up reasons, turns out it's <a href="https://github.com/GoogleChrome/puppeteer/issues/1718">Puppeteer's fault</a>. Ask them to fix it, not me.
5. Saved JSON uses the admid to save new entries. I'm sorry but, the admid-s are non-unique and can only be uniquely identified along with their roll no./reg number. Why? I don't know. Why have an ID system that's not pseudorandomly generated and not the primary key?

<b>If you fix them, I'll be glad.</b>

## Conclusion
Decades old syllabus, a failing structure, and lazy reforms, lousy security as well now. The new CBSE Chairperson, Ms. Anita Karwal, IAS, is an <a href="https://www.thebetterindia.com/112136/the-amazing-karwals/">immensely inspirational figure</a> (and her husband is, too). I simply wish the reforms she's aiming for take place sooner.

Oh and, all of my school's result is in the CBSEResults.json file. No personal details included.

Best,
Dirag B.
