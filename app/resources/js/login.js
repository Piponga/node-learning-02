
$(document).ready(function ()
{

});

$('#a-logout').click(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/logout",
        method: "POST",
        data: '',
        complete: function () {
            window.location.href = "/";
        }
    });
});

$('#a-login').click(function (e) {
    e.preventDefault();
    $.ajax({
        url: "/login",
        method: "GET",
        complete: function () {
            console.log(444);
        }
    });
});

$(document.forms['login-form']).on('submit', function (e) {
    e.preventDefault();
    var form = $(this);

    $('.error', form).html('');
    // $(':submit', form).button("loading");

    // $.ajax({
    //     url: "/login",
    //     method: "GET",
    //     complete: function () {
    //         console.log(444);
    //     }
    // });

    $.ajax({
        url: "/login",
        method: "POST",
        data: form.serialize(),
        complete: function () {
            // $(':submit', form).button("reset");
            console.log(88);
        },
        statusCode: {
            200: function () {
                console.log(11);
                form.html("Вы вошли на сайт").addClass('alert-success');
                // window.location.href = "/chat";
                window.location.href = "/";
            },
            403: function (jqXHR) {
                console.log(22);
                var error = JSON.parse(jqXHR.responseText);
                $('.error', form).html(error.message);
            }
        }
    });
    // return false;
});