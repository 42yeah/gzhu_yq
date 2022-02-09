// By 42yeah.

const fetch = require("node-fetch");
const cheerio = require("cheerio");
// const HttpsProxyAgent = require("https-proxy-agent");
const fs = require("fs");
const enc = require("./auxillary/strEnc");
// const agent = new HttpsProxyAgent("http://127.0.0.1:8080");

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


// Aux func
function makeCookieString(cookies) {
    let cookieString = "";
    cookies.forEach(cookie => {
        cookieString += cookie.split("; ")[0] + "; ";
    });
    return cookieString.substr(0, cookieString.length - 2);
}

async function fetchWithCookies(url, cookieString, casCookies) {
    let currentCookies = cookieString;
    if (url.startsWith("https://newcas.gzhu.edu.cn")) {
        currentCookies = casCookies;
    }
    let response = await fetch(url, {
        redirect: "manual",
        headers: {
            "Cookie": currentCookies
        }
    });
    while (response.status == 302) {
        if (response.headers.raw()["set-cookie"]) {
            cookieString = makeCookieString(response.headers.raw()["set-cookie"]);
        }

        let location = response.headers.raw()["location"][0];
        let currentCookies = cookieString;
        if (typeof location != "string") {
            location = location[0];
        }
        if (location.startsWith("https://newcas.gzhu.edu.cn")) {
            currentCookies = casCookies;
        }
        response = await fetch(location, {
            redirect: "manual",
            headers: {
                "Cookie": currentCookies
            }
        });
    }
    return {
        response,
        cookieString
    };
}

// Step 0: obtain client ID
async function obtainClientId() {
    const response = await fetch("https://yq.gzhu.edu.cn");
    return response;
}

// Step 1: log the fuck in
async function login(page, credentials) {
    let cookieString = makeCookieString(page.headers.raw()["set-cookie"]);
    const $ = cheerio.load(await page.text(), null, false);
    const formAction = "https://newcas.gzhu.edu.cn" + $("#loginForm").prop("action");

    const lt = $("#lt").val();
    const rsa = enc.strEnc(credentials["username"] + credentials["password"] + lt, "1", "2", "3");
    const ul = credentials["username"].length;
    const pl = credentials["password"].length;
    const execution = $("[name='execution']").val();
    const _eventId = $("[name='_eventId']").val();

    const formData = `rsa=${rsa}&ul=${ul}&pl=${pl}&lt=${lt}&execution=${execution}&_eventId=${_eventId}`;
    let response = await fetch(formAction, {
        method: "POST",
        mode: "cors",
        redirect: "manual",
        headers: {
            "Cookie": cookieString,
            "Upgrade-Insecure-Requests": "1",
            "sec-ch-ua": `" Not A;Brand";v="99", "Chromium";v="92"`,
            "User-Agent": `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": "newcas.gzhu.edu.cn",
            "Origin": "https://newcas.gzhu.edu.cn"
        },
        body: formData
    });

    i = 0;
    let casCookies = "";
    while (response.status == 302) {
        if (response.headers.raw()["set-cookie"]) {
            cookieString = makeCookieString(response.headers.raw()["set-cookie"]);
        }
        if (i == 0) {
            casCookies = cookieString;
        }

        let location = response.headers.raw()["location"];
        response = await fetch(location, {
            redirect: "manual",
            headers: {
                "Cookie": cookieString
            }
        });
        i += 1;
    }
    
    return {
        response,
        cookieString,
        casCookies
    };
}

// Step 2: start the affair/routine
async function startAffair(cookieString, casCookies) {
    const ret = await fetchWithCookies("https://yqtb.gzhu.edu.cn/infoplus/form/XNYQSB/start", cookieString, casCookies);
    const responseText = await ret.response.text();
    const $ = cheerio.load(responseText, null, false);

    const csrfToken = $("meta[itemscope='csrfToken']").prop("content");
    const workflowId = responseText.match("workflowId = (.+)")[1].substr(1, 36);
    const width = 600 + Math.floor(Math.random() * 500);
    const rand = Math.random() * 999;

    let formData = `workflowId=${workflowId}&rand=${rand}&width=${width}&csrfToken=${csrfToken}`;
    
    let response = await fetch("https://yqtb.gzhu.edu.cn/infoplus/interface/preview", {
        method: "POST",
        headers: {
            "Cookie": ret.cookieString,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": "https://yqtb.gzhu.edu.cn/infoplus/form/XNYQSB/start"
        },
        body: formData
    });
    const data = JSON.parse(await response.text());

    // Breadth-first search for the fields
    const views = data["entities"][0]["views"];
    let travQueue = [views[0]];
    let fields = [];

    while (travQueue.length != 0) {
        let el = travQueue[0];
        if (el.field) {
            fields.push(el.field);
        }
        travQueue.splice(0, 1);
        if (el.renders) {
            el.renders.forEach(render => {
                travQueue.push(render);
            });
        }
    }

    let finalData = {};
    const allData = data["entities"][0]["data"];
    for (key in allData) {
        if (fields.indexOf(key) != -1 || key.startsWith("_VAR")) {
            finalData[key] = allData[key]    ;
        }
    }
    finalData["_VAR_ENTRY_NAME"] = "";
    finalData["_VAR_ENTRY_TAGS"] = "";

    formData = `idc=XNYQSB&release=&csrfToken=${csrfToken}&formData=${JSON.stringify(finalData)}&lang=zh`;
    response = await fetch("https://yqtb.gzhu.edu.cn/infoplus/interface/start", {
        method: "POST",
        headers: {
            "Cookie": ret.cookieString,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        body: encodeURI(formData)
    });

    return {
        result: JSON.parse(await response.text()),
        cookieString
    };
}

// Step 3: check in
async function checkIn(affairResult, cookieString, casCookies) {
    let ret = await fetchWithCookies(affairResult.entities[0], cookieString, casCookies);
    let pageContent = await ret.response.text();
    // Stupid yq uses BOTH embedded JavaScript AND meta tag. For consistency, I will use regex for both.
    let stepId = pageContent.match(/formStepId = (.+);/)[1];
    const csrfToken = pageContent.match(/<meta itemscope="csrfToken" content="(.+)">/)[1];
    const instanceId = pageContent.match(/instanceId = "(.*)";/)[1];
    const width = 600 + Math.floor(Math.random() * 500);
    let rand = Math.random() * 999;
    const admin = false;
    const lang = "zh";

    let formData = `stepId=${stepId}&instanceId=${instanceId}&admin=${admin}&rand=${rand}&width=${width}&lang=${lang}&csrfToken=${csrfToken}`;

    let res = await fetch("https://yqtb.gzhu.edu.cn/infoplus/interface/render", {
        method: "POST",
        headers: {
            "Cookie": ret.cookieString,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": affairResult.entities[0]
        }, 
        body: encodeURI(formData)
    });
    let json = await res.json();
    
    // Construct fields using the same way
    const views = json.entities[0]["views"];
    let travQueue = [views[0]];
    let totalQueue = [];
    let fields = [];

    while (travQueue.length != 0) {
        let el = travQueue[0];
        if (el.field) {
            fields.push(el.field);
        }
        travQueue.splice(0, 1);
        if (el.renders) {
            el.renders.forEach(render => {
                travQueue.push(render);
                totalQueue.push(render);
            });
        }
    }

    let finalData = {};
    fields.forEach(field => {
        finalData[field] = "";
    });
    const allData = json.entities[0]["data"];
    // If, for some reason, something ends in "_Name" or "_Attr" (or _Code?)
    // is present in data, we add them to the fields too
    // There are still a few _VAR & _Code missing. We need to find out.
    // There are ALSO some fields which are NOT EQUAL. Need to find that out too.
    for (key in allData) {
        if (key in json.entities[0].fields && fields.indexOf(key) != -1) {
            if ("parent" in json.entities[0].fields[key]) {
                finalData[key + "_Attr"] = JSON.stringify({
                    _parent: allData[json.entities[0].fields[key].parent]
                });
            }
            if (json.entities[0].fields[key].type == "Code" &&
                !(key + "_Name" in finalData)) {
                finalData[key + "_Name"] = "";
            }    
        }
        if (fields.indexOf(key) != -1 || key.startsWith("_VAR") ||
            key.endsWith("_Attr") || key.endsWith("_Code") || key.endsWith("_Name") ||
            key.endsWith("_attr") || key.endsWith("_code") || key.endsWith("_name")) {
            finalData[key] = allData[key];

            // Also, unless something ends in "SJ", make it a string I guess?
            // HOWEVER, booleans are not to be stringified, for magical reasons that nobody cares.
            if (!key.endsWith("SJ") && typeof(finalData[key]) != "boolean") {
                finalData[key] = "" + finalData[key];
            }
        }
    }
    finalData["_VAR_ENTRY_NAME"] = "学生健康状况申报_";
    finalData["_VAR_ENTRY_TAGS"] = "疫情应用,移动端";
    finalData["_VAR_URL"] = "https://yqtb.gzhu.edu.cn/infoplus/form/12792160/render";

    const overrides = JSON.parse(fs.readFileSync("overrides.json"));
    for (key in overrides) {
        finalData[key] = overrides[key];
    }
    const timestamp = json.entities[0].step.timestamp;
    rand = Math.random() * 999;

    // Also overrides fieldSQSJ, because apparently we are in the future
    let today = new Date(0);
    today.setSeconds(finalData["fieldSQSJ"]);
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    finalData["fieldSQSJ"] = Math.floor(today / 1000);

    // Locate bound fields
    let bounds = [];
    for (field in json.entities[0].fields) {
        stuff = json.entities[0].fields[field];
        if (stuff.bound) {
            bounds.push(field);
        }
    }
    const boundFields = bounds.join(",");
    stepId = json.entities[0].step.flowStepId;
    const actionId = 1;

    // And finally, we make this massive POST twice...
    formData = `stepId=${stepId}&actionId=${actionId}&formData=${JSON.stringify(finalData)}&timestamp=${timestamp}&rand=${rand}&boundFields=${boundFields}&csrfToken=${csrfToken}&lang=${lang}`;

    res = await fetch("https://yqtb.gzhu.edu.cn/infoplus/interface/listNextStepsUsers", {
        method: "POST",
        headers: {
            "Cookie": ret.cookieString,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": affairResult.entities[0]
        }, 
        body: encodeURI(formData)
    });
    json = await res.json();
    if (json.ecode != "SUCCEED") {
        console.log("listNextStepUsers failed. Result: ", json);
        return false;
    }

    formData += `&remark=&nextUsers={}`;

    res = await fetch("https://yqtb.gzhu.edu.cn/infoplus/interface/doAction", {
        method: "POST",
        headers: {
            "Cookie": ret.cookieString,
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": affairResult.entities[0]
        }, 
        body: encodeURI(formData)
    });
    json = await res.json();
    if (json.ecode == "SUCCEED") {
        console.log("Succeeded: ", json);
        return true;
    }
    console.log("doAction failed. Result: ", json);
    return false;
}

async function go(credentials) {
    let response = await obtainClientId();
    let ret = await login(response, credentials);
    let casCookies = ret.casCookies;
    ret = await startAffair(ret.cookieString, casCookies);
    return await checkIn(ret.result, ret.cookieString, casCookies);
}

module.exports.go = go;
