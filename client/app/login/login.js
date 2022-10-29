const formEl = document.getElementById("login-form");
const msgEl = document.getElementById("message");

function init() {
    formEl.onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        fetch(`http://${location.hostname}:8001/loginuser`, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ username: formData.get("username"), password: formData.get("password") }),
        })
            .then((res) => {
                console.info("[login] res: %o", res);
                if (res.status === 200) {
                    // console.log("**********")
                    //  localStorage.setItem('id', 'Tom');
                    console.log(res.data)
                    window.location.pathname = "/";  
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
    };
}

init();
