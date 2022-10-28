const formEl = document.getElementById("reg-form");
const msgEl = document.getElementById("message");

function init() {
    formEl.onsubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        fetch(`http://${location.hostname}:8001/signup`, {
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
                    alert("added succefully")
                    setTimeout(window.location.replace(`http://${location.hostname}:8002/`), 3000);
                    
                } else{
                    alert(`somthing went wrong `)

                }
            })
            .catch((rea) => {
                msgEl.textContent = "sign up failed";
            });
    };
}

init();
