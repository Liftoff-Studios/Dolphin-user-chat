/**Credits to Quinn Gibson */
function cleanseText(text) {
                text = text.replace(/</g, "&lt");
                
                text = text.replace(/(https:\/\/[^\s\n]+)/gi, "<a href = \"$1\" target = \"_blank\">$1</a>");
                
                text = text.replace(/\n/g, "<br>");
                
                text = text.replace(/\_([^\_]+)\_/g, "<em>$1</em>");
                
                text = text.replace(/\*([^\*]+)\*/g, "<strong>$1</strong>");
                
                text = text.replace(/```([^`]+)```/g, "<code>$1</code>");
                
                text = text.replace(/\`([^\`]+)\`/g, "<code style = \"display : inline;\">$1</code>");
                
                
                return text;
            }



/**Intervaljs */
let cookie;
let mainArray = [];
var curr_grpIn = ""
var te = ""

if(curr_grpIn==""){
    document.getElementById("stuff").style.display = "none";
}
let chat_rerender = ()=>{
    document.getElementById("chats").innerHTML = "";
    for(var i =0;i<mainArray.length;i++){
        let foo = document.createElement("div");
        te = mainArray[i].group_name;
        foo.classList.add("grp-names");
        foo.onclick = function(){
            update_message(te,function(e){
                render_messages(te);
            })
            document.getElementById("stuff").style.display = "block";
            curr_grpIn = te;
        }
        foo.textContent = mainArray[i].group_name;
        

        document.getElementById("chats").appendChild(foo)
        
    }
}

let add_user =(name)=>{
    alert('This will only work if you have created the group');
    let username = window.prompt("Enter username of user you want to add");
    let data = {
        name:name,
        username:cookie.username,
        userad:username,
        auth:cookie.authentication
    }
    fetch("https://c.liftoff-ka.repl.co/add-member",{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).then(d=>{
        if(d.hasOwnProperty("success")){
            let index = mainArray.map((e)=>{
                return e.group_name
            }).indexOf(name);

            mainArray[index].members.push(username)
            print(`Successfully added User: ${username}`)
        }else{
            alert("Error occured while trying, maybe you entered the wrong username to add?")
        }
    })
}

let remove_user =(name)=>{
    alert('This will only work if you have created the group');
    let username = window.prompt("Enter username of user you want to remove");
    let data = {
        name:name,
        username:cookie.username,
        userad:username,
        auth:cookie.authentication
    }
    fetch("https://c.liftoff-ka.repl.co/remove-member",{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).then(d=>{
        console.log(d)
        if(d.hasOwnProperty("success")){
            let index = mainArray.map((e)=>{
                return e.group_name
            }).indexOf(name);

            let foobar = mainArray[index].members.indexOf(username)
            mainArray[index].members.splice(foobar,1);
            print(`Successfully Removed User: ${username}`)
        }else{
            alert("Error occured while trying, maybe you entered the wrong username to add?")
        }
    })
}

let render_messages = (name1)=>{
    let index = mainArray.map((e)=>{
        return e.group_name
    }).indexOf(name1);
    let name;
    if(name1.includes("'")){
        name = name1.replace(/'/gi,"\\'")
    }else{
        name= name1
    }
    
    document.getElementById("messages").innerHTML =  `<button onclick="add_user('${name}');">Add User</button><button onclick="remove_user('${name}');">Remove User</button><button onclick="delete_group('${name}');">Delete this Group</button>`;
    console.log( document.getElementById("messages").innerHTML)
    for(var i = 0;i<mainArray[index].msgs.length;i++){
        let curr = mainArray[index].msgs[i];
        let goo = new Date(curr.time_posted)
        let foo = `<div class="grp-message"><span><small><b>By: ${curr.username}</b></small></span><br><span>${cleanseText(curr.content)}<br><span><small>${goo.toLocaleString(undefined)}</small></span></span></div>`

        document.getElementById("messages").innerHTML =  document.getElementById("messages").innerHTML + foo;
    }
}

let send_message = ()=>{
    let va = document.getElementById("new-message-input").value
    let date = new Date().toUTCString();
    
    let data = {
        username:cookie.username,
        contents:va,
        time_posted: date,
        auth:cookie.authentication,
        name:curr_grpIn
    }
    fetch("https://c.liftoff-ka.repl.co/add-message",{
         method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).then(d=>{
        
        check_messages(cookie.username,cookie.authentication)
    })
}

let delete_group =(name)=>{
    alert('This will only work if you have created the group');
    
    let data = {
        name:name,
        username:cookie.username,
        auth:cookie.authentication
    }
    fetch("https://c.liftoff-ka.repl.co/delete-group",{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).then(d=>{
        if(d.hasOwnProperty("success")){
            let index = mainArray.map((e)=>{
                return e.group_name
            }).indexOf(name);

            mainArray.splice(index,1)
            print(`Successfully deleted group: ${name}`)
            chat_rerender();           
            curr_grpIn = ""
            render_messages(curr_grpIn);
        }else{
            alert("Error occured while trying, maybe you entered the wrong username to add?")
        }
    })
}

let check_messages = (username, auth)=>{
    console.log("Routine Check ")
    get_grps(username,auth,function(d){
        if(mainArray.length!=d.length){
            print("Please Check your groups. You have been added to or removed from a group or you have deleted or created a group");
            mainArray = d;
            chat_rerender()
        }

        let data = d.sort((a,b)=>{
            return a.group_name.localeCompare(b.group_name)
        })
        mainArray.sort((a,b)=>{
            return a.group_name.localeCompare(b.group_name)
        })
        
        for(var j = 0;j<mainArray.length;j++){
            
            if(mainArray[j].msgs.length!=data[j].msgs.length){
                print(`A new message in group: ${mainArray[j].group_name};`)
                update_message(mainArray[j].group_name,function(e){
                    render_messages(curr_grpIn)
                });
                
            }
        }
    })
}


let print = (content)=>{
    let foo = document.createElement("div");
    foo.innerHTML = content;
    console.log(content)
    document.getElementById("log").appendChild(foo);
}

let update_message = (name,done)=>{
    let data = {
        name:name,
        username:cookie.username,
        auth:cookie.authentication
    }
    fetch("https://c.liftoff-ka.repl.co/get-messages",{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).then(d=>{
        let index;

        for(var j=0;j<mainArray.length;j++){
            if(mainArray[j].group_name==name){
                index = j;
                mainArray[j].msgs = d;
            }
        }

        done("Hi")
    })
}


/**Group js */

let get_grps = (username,auth,done)=>{
    let data = {
        username:username,
        auth:auth
    }
    fetch("https://c.liftoff-ka.repl.co/get_grps", {
        method: 'POST', 
        headers:{
            "content-type":"application/json",
        },
        body: JSON.stringify(data),
    }).then(response=>response.json()).then(d=>{
        
        if(!d.hasOwnProperty("error")){
            done(d);
        }
    })
}

let create_group = ()=>{
    let name = window.prompt("Enter Group Name");
    let dat = {
        name:name,
        username:cookie.username,
        auth:cookie.authentication
    }
    fetch("https://c.liftoff-ka.repl.co/cr-grp",{
        method:"POST",
        headers:{
            "content-type":"application/json",
        },
        body:JSON.stringify(dat)
    }).then(response=>response.json()).then(d=>{
        
        get_grps(cookie.username,cookie.authentication,function(d){
            mainArray = d;
            chat_rerender()
        })
    })
}



/*
* Login Part
*/


let get_cookie = ()=>{
    let username,authentication;
    let checker = document.cookie.split(";")
    for(var i =0; i<checker.length;i++){
        let foobar = checker[i].split("=");
        if(foobar[0]=="username"){
            username = foobar[1]
        }
        if(foobar[0]==" authenti"){
            authentication = foobar[1]
        }
    }

    return {
        username:username,
        authentication:authentication
    }
} 

let interval_func = ()=>{
    check_messages(cookie.username,cookie.authentication)
}

function start(){
    cookie = get_cookie();
    get_grps(cookie.username,cookie.authentication,function(d){
        
        document.getElementById("sign-page").style.display = "none";
        document.getElementById("main").style.display = "block";

        if(d[0]==undefined){
            document.getElementById("chats").innerHtml = `You have not joined any chats. To join one please request the chat creater to add you to one. You can also create a chat (Only after email verification)`
        }else{
            mainArray = d;
            
            chat_rerender();
            window.setInterval(interval_func,5000);
        }

        
    })
}


let $ = x => document.querySelector(x);

let checker = document.cookie.split(";");
let does_have_username = false;
let does_have_auth = false;
for(var i =0; i<checker.length;i++){
    let foobar = checker[i].split("=");
    
    if(foobar[0]=="username"){
        does_have_username = true;
        
    }else 
    if(foobar[0]==" authenti"){
        does_have_auth = true;
    }
}

if(does_have_auth && does_have_username){
    document.getElementById("sign-page").style.display = "none";
    start();
}else{
    $("#sign-page").style.display = "block";
    $("#sign-up-form").style.display = "none";
    document.getElementById("main").style.display = "none";

}

/*Submit form*/
let create_user = () => {
    let username = $("#cr-user");
    let password = $("#cr-pass");
    let email = $("#cr-email");

    let data = {
        username:username.value,
        password:password.value,
        email:email.value
    }
    fetch("https://c.liftoff-ka.repl.co/create-user", {
        method: 'POST', 
        headers:{
            "content-type":"application/json",
        },
        body: JSON.stringify(data),
    });

   document.getElementById("check-email-div").innerHtml = `Please check your email for a verification link. If you have not receivied a mail, it means that your application was invalid`;
}


let log_user = () => {
    let username = $("#log-user");
    let password = $("#log-pass");
    

    let data = {
        username:username.value,
        password:password.value,
    }
    fetch("https://c.liftoff-ka.repl.co/get-auth", {
        method: 'POST', 
        headers:{
            "content-type":"application/json",
        },
        body: JSON.stringify(data),
    }).then(response => response.json()).then(d=>{
        
        if(!d.hasOwnProperty("error")){
            let foo = "username="+d.user+";SameSite=Strict";
            let foo1 = "authenti="+d.auth+";SameSite=Strict";
            document.cookie = foo;
            document.cookie = foo1;

            
        }else{
            
        }
        start()
    })

    
}

let show_signup = ()=>{
    document.getElementById("sign-up-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
}

let show_login = ()=>{
    document.getElementById("sign-up-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}