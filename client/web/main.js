const userInfoEl = document.getElementById("user-info");
const userStatusEl = document.getElementById("user-status");
const userMsgEl = document.getElementById("user-msg");

const nameMsg = document.getElementById("namemsg");
const linkMsg = document.getElementById("linkmsg");

const loginEl = document.getElementById("login-container");
const logoutBtnEl = document.getElementById("logout-btn");

const divtable = document.getElementById("divtable");


const reconnectEl = document.getElementById("reconnect");
const signup = document.getElementById("signup");
const formDiv = document.getElementById("formdiv");


const TOKEN_KEY = "SESSION_TOKEN";
var flag = false;



function setUserState(logged) {
    if (logged) {
        loginEl.className = "none";
        logoutBtnEl.className = "";
        formDiv.className = ""
        
    } else {
        loginEl.className = "";
        logoutBtnEl.className = "none";
        userInfoEl.textContent = "null";
        formDiv.className = "none"
    }
}

function fetchUser() {
    return new Promise((resolve, reject) => {
        fetch(`http://${location.hostname}:8001/user`, {
            headers: {
                Authorization: localStorage.getItem(TOKEN_KEY),
            },
        })
            .then((res) => {
                userStatusEl.textContent = res.status;
                userMsgEl.textContent = res.statusText;

                return res.json();
            })
            .then((res) => {
                if (res.msg) {
                    userMsgEl.textContent = res.msg;
                }

                if (res.code === 0) {
                    const { username } = res.data;
                    userInfoEl.textContent = username;
                    setUserState(true);
                    flag = true;
                    

                    localStorage.setItem('id',res.data.id);
                    resolve({ username });
                } else {
                    setUserState(false);

                    reject(res);
                }
            })
            .catch((rea) => {
                console.error("[user] err: %o", rea);

                setUserState(false);

                if (rea.msg) {
                    userMsgEl.textContent = rea.msg;
                }

                reject(rea);
            });
    });
}

function fetchData() {
    return  fetch(`http://${location.hostname}:8001/getalldata`)
        .then((res) => {
            return res.json();
        })
        .catch((rea) => {
            console.error("[login] error: %o", rea);
           
        });
}

function tableCreate(data) {
    //body reference 
    var body = document.getElementById("body");
  
    // create elements <table> and a <tbody>
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
  
    // cells creation
    for (var j = 0; j < data.length; j++) {
      // table row creation
      var row = document.createElement("tr");
      var a = document.createElement('a');
      var linkText = document.createTextNode(data[j].name);
      a.appendChild(linkText);
      a.title = data[j].name;
      a.href = data[j].link;
      a.target="_blank";
      console.log(data[j].authuserId)

  
      for (var i = 0; i < 1; i++) {
        // create element <td> and text node 
        //Make text node the contents of <td> element
        // put <td> at end of the table row
        var cell = document.createElement("td");
        var cellText = document.createTextNode("Name : " + data[j].name + ", link :  ");
  
        cell.appendChild(cellText);
        cell.appendChild(a);
        row.appendChild(cell);
      }
  
      //row added to end of table body
      tblBody.appendChild(row);
    }
  
    // append the <tbody> inside the <table>
    tbl.appendChild(tblBody);
    // put <table> in the <body>
    body.appendChild(tbl);
    // tbl border attribute to 
    tbl.setAttribute("border", "2");
  }

function submit_by_id(e) {
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    
    if (name && email) // Calling validation function
    {
       
        fetch(`http://${location.hostname}:8001/setdata`, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ name: name, link: email
            , authuserId: "1"
        }),
        })
            .then((res) => {
                console.info("[login] res: %o", res);
                if (res.status === 200) {
                    // alert("asj")
                    init()
                    location.reload();
                } else if(res.status === 401)   {
                    msgEl.textContent = "password incorrect";
                }else{
                    alert(`${formData.get("username")} is not found`)

                }
            })
            .catch((rea) => {
                console.error("[login] error: %o", rea);
                msgEl.textContent = "Login failed";
            });
    }
    e.preventDefault();
    }

function linkWS() {
    const disconnectEl = document.getElementById("disconnect");
    const messageEl = document.getElementById("message");
    const qrcodeEl = document.getElementById("qr-canvas");
    const ws = new WebSocket(`ws://${location.hostname}:8001`);

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        messageEl.textContent = data.msg;

        const step = data.data && data.data.step;

        if (step === 0) {
            const login = document.createElement("a");
            const signup = document.createElement("a");
            login.href = data.data.url;
            login.setAttribute("target", "_blank");
            login.setAttribute("rel", "noopener noreferrer");
            login.textContent = "login";
            login.style = "margin-left: 8px;";


            signup.href = `http://${location.hostname}:8003/signup/`;
            signup.setAttribute("target", "_blank");
            signup.setAttribute("rel", "noopener noreferrer");
            signup.textContent = "signup";
            signup.style = "margin-left: 8px;";

            messageEl.appendChild(login);
            messageEl.appendChild(signup);

            QRCode.toCanvas(qrcodeEl, data.data.url, function (error) {
                if (error) console.error(error);
                console.log("QR code generated successfully");
            });
        } else if (step === 2) {
            const { username, token } = data.data;
            localStorage.setItem(TOKEN_KEY, token);

            const ctx = qrcodeEl.getContext("2d");
            ctx.clearRect(0, 0, qrcodeEl.width, qrcodeEl.height);
            ws.close();

            fetchUser();
        }
    };

    ws.onopen = function () {
        ws.send(JSON.stringify({ type: "server", code: 0, step: 0 }));
    };

    ws.onclose = function () {
        messageEl.textContent = "disconnect";
    };

    disconnectEl.onclick = function () {
        ws.close();
    };
}

logoutBtnEl.onclick = function () {
    fetch(`http://${location.hostname}:8001/logout`, {
        method: "POST",
        headers: {
            Authorization: localStorage.getItem(TOKEN_KEY),
        },
    })
        .then((res) => {
            console.info("Logout.", res);
            flag = false;
            location.reload();
            init();
        })
        .catch((e) => {
            console.error("Logout error.", e);
        });
};

reconnectEl.onclick = function () {
    linkWS();
};

async function init() {
    fetchUser()
        .then((res) => {
            console.info(res);
            // ignore
        })
        .catch((rea) => {
            linkWS();
        });

        var data = await fetchData();
        if(flag){
            if(data){
                tableCreate(data)
            }
        }


}

init();
