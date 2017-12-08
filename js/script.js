var url = "http://localhost:8888";

function registerUser() {
    var username = document.getElementsByClassName("username");
    var password = document.getElementsByClassName("password");

    $.ajax({
        url: url + "/register",
        method: "post",
        data: {
            username: username[0].value,
            password: password[0].value
        }
    }).success(function(response){
        alert(response.message);
    }).error(function(response) {
        alert(response.message);
    });
}

function loginUser() {
    var username = document.getElementsByClassName("username");
    var password = document.getElementsByClassName("password");

    $.ajax({
        url: url + "/login",
        method: "post",
        data: {
            username: username[0].value,
            password: password[0].value
        }
    }).success(function(response){
        window.location.assign("/home");
    }).error(function(response) {
        alert("Incorrect username or password!");
    });
}

function getUser() {
    var username = document.getElementsByClassName("username");

    $.ajax({
        url: url + "/user",
        method: "get"
    }).success(function(response){
        document.getElementsByClassName("username")[0].innerHTML = response.username;
    }).error(function(response) {
        alert("Cannot fetch data. Please try again");
    });

    $.ajax({
        url: url + "/items",
        method: "get"
    }).success(function(response) {

        //Loop through each row and display them in the HTML
        for(var a = 0; a < response.length; a++) {
            var item = response[a];

            //Display owner items data in the table
            $("#itemtable").append("<tr>" + 
                    "<td>" + item._id + "</td>" +
                    "<td>" + item.details + "</td>" + 
                    "<td>" + item.post_time + "</td>" +
                    "<td>" + item.edit_time + "</td>" +
                    '<td><button class="but1" onclick="editItem(\'' + item._id + '\')">edit</button></td>' +
                    '<td><button class="but1" href="#" onclick="deleteItem(\'' + item._id + '\')">delete</button></td>' +
                    "<td>" + item.isPublic + "</td>" +
                "</tr>");
        }
    }).error(function(response) {
        alert("Cannot fetch data. Please try again");
    });
}

function editItem(id) {
    var details = prompt("Please enter new details (" + id + ")", "");
    if(details === null) { //If cancel button was pressed don't continue
        return;
    }

    var isPublic = prompt("Change public post? (true/false)", "");
    if(isPublic === null) { //If cancel button was pressed don't continue
        return;
    }

    if (details !== "" && isPublic !== "") {

        //This was a string the a boolean as we'll play by their game
        if(isPublic.toLowerCase() === "true" || isPublic.toLowerCase() === "false" ){
            $.ajax({
                url: url + "/edit",
                method: "post",
                data: {
                    _id: id,
                    details: details,
                    isPublic: isPublic
                }
            }).success(function(response){
                alert("Item successfully edited!");
                window.location.assign("/home");
            }).error(function(response) {
                alert("Cannot edit item. Please try again");
            });
        } else {
            alert('You can only place true OR false for public post');
            return;
        }
    } else {
        alert('You cannot leave empty fields');
    }
}

function deleteItem(id) {
    var decision = confirm("You are about to delete this row (" + id + "). Are you sure you want to delete it?");

    if(decision) {
        $.ajax({
            url: url + "/delete",
            method: "post",
            data: {
                _id: id
            }
        }).success(function(response){
            alert("Item successfully deleted!");
            window.location.assign("/home");
        }).error(function(response) {
            alert("Cannot delete item. Please try again");
        });
    }
}

function addItem() {
    var details = document.getElementsByClassName("details")[0];
    var isPublic = document.getElementsByClassName("isPublic")[0];
    console.log("hi")
    $.ajax({
        url: url + "/add",
        method: "post",
        data: {
            details: details.value,
            isPublic: isPublic.checked
        }
    }).success(function(response){
        alert("Item successfully added!");
        //Append the data in the table
        $("#itemtable").append("<tr>" + 
                "<td>" + response.item._id + "</td>" +
                "<td>" + response.item.details + "</td>" + 
                "<td>" + response.item.post_time + "</td>" +
                "<td>" + response.item.edit_time + "</td>" +
                '<td><button class="but1" onclick="editItem(\'' + response.item._id + '\')">edit</button></td>' +
                '<td><button class="but1" href="#" onclick="deleteItem(\'' + response.item._id + '\')">delete</button></td>' +
                "<td>" + response.item.isPublic + "</td>" +
            "</tr>");

    }).error(function(response) {
        alert("Cannot add item. Please try again");
    });
}

function getPublicItems() {

    $.ajax({
        url: url + "/items/public",
        method: "get"
    }).success(function(response) {

        //Loop through each row and display them in the HTML
        for(var a = 0; a < response.length; a++) {
            var item = response[a];

            //Display public items data in the table
            $("#publicitemtable").append("<tr>" + 
                    "<td>" + item._id + "</td>" +
                    "<td>" + item.details + "</td>" + 
                    "<td>" + item.post_time + "</td>" +
                    "<td>" + item.edit_time + "</td>" +
                "</tr>");
        }
    }).error(function(response) {
        alert("Cannot fetch data. Please try again");
    });
}