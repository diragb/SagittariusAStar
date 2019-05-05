const puppeteer = require('puppeteer');
const fs = require('fs');
const fNameSet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// Open CBSEScrapingAnalytics.json, and initialize values.
let analyticsString = fs.readFileSync('CBSEScrapingAnalytics.json');
let analyticsJSON = JSON.parse(analyticsString);
var regno = parseInt(analyticsJSON['regnoLast']) + 1, regnoLimit = analyticsJSON['regnoLimit'], regnoEnd = parseInt(analyticsJSON['regnoEndLast']) + 1, schNo = parseInt(analyticsJSON['schNoLast']), schNoBeg = parseInt(analyticsJSON['schNoBegLast']), fLetterPos = analyticsJSON['fNameLast'], sLetterPos = 0, admid, cno = parseInt(analyticsJSON['cnoLast']), cnoEnd = parseInt(analyticsJSON['cnoEndLast']), oldRequestCount = analyticsJSON['requestsTillNow'], requestCount = analyticsJSON['requestsTillNow'];
var timeoutHappened = false;

async function pad(n, width, padder) {
    padder = padder || '0';
    n = n + '';
    return n.length >= width ? n.toString().slice(-width) : new Array(width - n.length + 1).join(padder) + n;
}

async function processDetails() {
    var trueHit = false, fullLoopNoRetrieve = false;
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await console.log('Scraping details..');
    while (regno <= regnoLimit) {
        admid = fNameSet[fLetterPos] + fNameSet[sLetterPos] + await pad(regnoEnd, 2) + await pad(schNoBeg, 2) + await pad(cnoEnd, 2);
        await page.goto('http://cbseresults.nic.in/class12/class12th19.htm', {waitUntil: 'domcontentloaded', timeout: 0});
        await page.evaluate((regno, schNo, cno, admid, timeoutHappened) => {
            function pad(n, width, padder) {
                padder = padder || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(padder) + n;
            }
            if (typeof document.getElementsByName('regno')[0] === 'undefined') {
                timeoutHappened = true;
            } else {
                document.getElementsByName('regno')[0].value = pad(regno, 7);
                document.getElementsByName('sch')[0].value = pad(schNo, 5);
                document.getElementsByName('cno')[0].value = pad(cno, 4);
                document.getElementsByName('admid')[0].value = admid;
                document.getElementsByName('B2')[0].click();
            }
        }, regno, schNo, cno, admid, timeoutHappened);
        if (timeoutHappened) {
            // Input page timeout, reload.
            timeoutHappened = false;
            await page.reload();
        } else {
            // Input page downloaded successfully.
            await page.waitForNavigation({timeout: 0});
            trueHit = await page.evaluate((regno, schNo, cno, admid, requestCount, oldRequestCount) => {
                function pad(n, width, padder) {
                    padder = padder || '0';
                    n = n + '';
                    return n.length >= width ? n : new Array(width - n.length + 1).join(padder) + n;
                }

                if (typeof document.getElementsByTagName('table')[4] === 'undefined') {
                    timeoutHappened = true;
                } else {
                    if (document.getElementsByTagName('table')[4].width == '75%') {
                        // MarksSniffer(TM) starts here lol.
                        var name, subCodeArray = [], subRowCount = 0, addSubExists = false, subRowAdditional = false, subName, theoryMarks, practicalMarks, totalMarks, grades, finalResultCount = 0, finalResult;
                        var cbseResultJSON = ',\n\t"' + admid + '": {\n\t\t"regno": "' + pad(regno, 7) + '",\n\t\t"schoolNo": "' + pad(schNo, 5) + '",\n\t\t"cno": "' + pad(cno, 4) + '"';
                        
                        // Scrape name.
                        name = document.getElementsByTagName('table')[4].childNodes[1].childNodes[2].childNodes[3].childNodes[0].innerText;
                        cbseResultJSON = cbseResultJSON + ',\n\t\t"name": "' + name + '"';

                        // Check if additional subject exists, and collect Subject Codes into an array.
                        cbseResultJSON = cbseResultJSON + ',\n\t\t"subname": [\n\t\t\t';
                        for (var i = 2; typeof document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[1].childNodes[0].innerText !== 'undefined'; i = i + 2) {
                            subCode = document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[1].childNodes[0].innerText;
                            if (subCode == "  Additional Subject") {
                                // Additional subject exists.
                                addSubExists = true;
                                subRowAdditional = i;
                            } else {
                                subCodeArray.push(subCode);
                                subName = document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[3].childNodes[0].innerText;
                                cbseResultJSON = cbseResultJSON + '"' + subName + '",\n\t\t\t';
                            }
                            subRowCount = i;
                        }
                        cbseResultJSON = cbseResultJSON.substring(0, cbseResultJSON.length - 5);                    // 11% faster than slice.
                        cbseResultJSON = cbseResultJSON + '\n\t\t]';
                        
                        // Scrape theory, practical, total marks.
                        var theoryMarksJSON = ',\n\t\t"theory": {\n\t\t\t';
                        var practicalMarksJSON = ',\n\t\t"practical": {\n\t\t\t';
                        var totalMarksJSON = ',\n\t\t"totalMarks": {\n\t\t\t';
                        var gradesJSON = ',\n\t\t"grades": {\n\t\t\t';
                        for (var i = 2, j = 0; i <= subRowCount; i = i + 2) {
                            if (i != subRowAdditional) {
                                theoryMarks = parseInt(document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[5].childNodes[0].innerText);
                                practicalMarks = parseInt(document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[7].childNodes[0].innerText);
                                totalMarks = parseInt(document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[9].childNodes[0].innerText);
                                grades = document.getElementsByTagName('table')[5].childNodes[1].childNodes[i].childNodes[11].childNodes[0].innerText;
                                gradesJSON = gradesJSON + '"' + subCodeArray[j] + '": "' + grades + '",\n\t\t\t';
                                
                                // Check theory marks, input if valid.
                                if (!isNaN(theoryMarks)) {
                                    theoryMarksJSON = theoryMarksJSON + '"' + subCodeArray[j] + '": ' + theoryMarks + ',\n\t\t\t';
                                }

                                // Check practical marks, input if valid.
                                if (!isNaN(practicalMarks)) {
                                    practicalMarksJSON = practicalMarksJSON + '"' + subCodeArray[j] + '": ' + practicalMarks + ',\n\t\t\t';
                                }

                                // Check total marks, input if valid.
                                if (!isNaN(totalMarks)) {
                                    totalMarksJSON = totalMarksJSON + '"' + subCodeArray[j] + '": ' + totalMarks + ',\n\t\t\t';
                                }
                                
                                j++;
                            }
                        }
                        theoryMarksJSON = theoryMarksJSON.substring(0, theoryMarksJSON.length - 5);                 // 11% faster than slice.
                        theoryMarksJSON = theoryMarksJSON + '\n\t\t}';
                        practicalMarksJSON = practicalMarksJSON.substring(0, practicalMarksJSON.length - 5);        // 11% faster than slice.
                        practicalMarksJSON = practicalMarksJSON + '\n\t\t}';
                        totalMarksJSON = totalMarksJSON.substring(0, totalMarksJSON.length - 5);                    // 11% faster than slice.
                        totalMarksJSON = totalMarksJSON + '\n\t\t}';
                        gradesJSON = gradesJSON.substring(0, gradesJSON.length - 5);                                // 11% faster than slice.
                        gradesJSON = gradesJSON + '\n\t\t}';

                        // Add marks to JSON.
                        cbseResultJSON = cbseResultJSON + theoryMarksJSON + practicalMarksJSON + totalMarksJSON + gradesJSON;

                        // Scrape final result.
                        finalResultCount = subRowCount + 2;
                        finalResult = document.getElementsByTagName('table')[5].childNodes[1].childNodes[finalResultCount].childNodes[3].childNodes[0].innerText.slice(11).trim();
                        cbseResultJSON = cbseResultJSON + ',\n\t\t"result": "' + finalResult + '",\n\t\t"requestCount": ' + (requestCount - oldRequestCount) + '\n\t}';
                        oldRequestCount = requestCount;

                        return cbseResultJSON;
                    } else {
                        return false;
                    }
                }
            }, regno, schNo, cno, admid, requestCount, oldRequestCount);
            if (timeoutHappened) {
                // Result page suffered a timeout, navigate to previous via loop.
                timeoutHappened = false;
            } else {
                // Result page has rendered successfully.
                if (trueHit != false) {
                    // Save string and move along.
    
                    /*
                    Deprecated: Takes a screenshot and moves along, but requires {headless: false}, decreasing processing speed.
                    await page.setViewport({width: 1000, height: 700});
                    await page.screenshot({path: admid + '.png'});
                    */
    
                    /*
                    Creates several file handles, can crash node.js if extreme.
                    fs.writeFile(
                        'CBSEResults.json',
                        trueHit,
                        function (err) {
                            if (err) throw err;
                        });
                    */
    
                   console.log('Admit ID: ' + admid + ' | SCRAPED');

                    var ResultsStream = fs.createWriteStream("CBSEResults.json", {flags: 'a'}).write(trueHit);
                    var trueHitDetails = '{\n\t"regnoLast": "' + await pad(regno, 7) + '",\n\t"fNameLast": ' + fLetterPos + ',\n\t"regnoLimit": ' + regnoLimit + ',\n\t"regnoEndLast": "' + await pad(regnoEnd, 2) + '",\n\t"schNoLast": "' + await pad(schNo, 5) + '",\n\t"schNoBegLast": "' + await pad(schNoBeg, 2) + '",\n\t"cnoLast": "' + await pad(cno, 4) + '",\n\t"cnoEndLast": "' + await pad(cnoEnd, 2) + '",\n\t"requestsTillNow": ' + requestCount + '\n}';
                    var AnalyticsStream = fs.createWriteStream("CBSEScrapingAnalytics.json", {flags: 'w'}).write(trueHitDetails);
                    
                    fullLoopNoRetrieve = false;
                    sLetterPos = 0;
                    regno++;
                    regnoEnd++;
                } else if (trueHit == false) {
                    if (sLetterPos < 25) {
                        sLetterPos++;
                    } else {
                        // sLetter screened, set it to 0 and increase fLetterPos.
                        sLetterPos = 0;
                        fLetterPos++;
                    }
                    if (fLetterPos > 25 && fullLoopNoRetrieve == false) {
                        // Data irretrieveable (no spell-checks, please), perhaps we're entering next class OR the next partition has started.
                        fLetterPos = 0;
                        sLetterPos = 0;
                        fullLoopNoRetrieve = true;
                    } else if (fLetterPos > 25 && fullLoopNoRetrieve == true) {
                        // Perhaps the next partition has started.
                        fullLoopNoRetrieve = false;
                        schNo++;
                        schNoBeg++;
                        cno++;
                        cnoEnd++;
                    }
                }
                requestCount++;
            }
        }
    }
    // regnoLimit has been crossed, notify.
    await page.evaluate(() => {
        alert("I love you.\nYour limit has been reached, contact Dirag to get new space.");
    });
}

processDetails();