(function () {
    "use strict";
    function setUploadProgress(percent) {
        $("#progress").children().css("width", percent * 100 + "%");
    }
    function timeFormatter(sec) {
        var a = [];
        a.push(Math.floor(sec / 60));
        sec %= 60;
        a.push(sec < 10 ? "0" + sec : sec);
        return a.join(':');
    }
    $("#song").change(function (e) {
        var form = document.getElementById("form-upload"), fd = new FormData(form);
        $.ajax({
            url: form.action,
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            dataType: "json",
            beforeSend: function (jqXHR, settings) {
                setUploadProgress(0);
                $("#progress").removeClass("hidden");
                $("#set-range").addClass("hidden");
            },
            success: function (data, textStatus, jqXHR) {
                $("#progress").addClass("hidden");
                $("#set-range").removeClass("hidden");
                $("#range-invalid").addClass("hidden");
                $("#submit").removeAttr("disabled");
                $("#filename").val(data.filename);
                $("#originName").val(data.originName);
                $("#range")
                    .slider('destroy')
                    .slider({
                        "tooltip": "always",
                        "min": 0,
                        "max": data.duration,
                        "value": [0, 40],
                        "formatter": function (time) {
                            return timeFormatter(time[0]) + ' - ' + timeFormatter(time[1]);
                        }
                    })
                    .on("slide", function (e) {
                        var duration = e.value[1] - e.value[0];
                        if (duration < 0 || duration > 40) {
                            $("#range-invalid").removeClass("hidden");
                            $("#submit").attr("disabled", "disabled");
                        } else {
                            $("#range-invalid").addClass("hidden");
                            $("#submit").removeAttr("disabled");
                        }
                    });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("#progress").addClass("hidden");
                alert("上传失败，请上传不超过 10M 的歌曲");
            },
            xhr: function () {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", function (evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = evt.loaded / evt.total;
                        setUploadProgress(percentComplete);
                    }
                }, false);
                return xhr;
            }
        });
    });
}());
