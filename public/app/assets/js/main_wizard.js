$(function () {
    $("html").on("click", function () {
        $(".select .dropdown").hide()
    }),
        $(".select").on("click", function (t) {
            t.stopPropagation()
        }),
        $(".select .select-control").on("click", function () {
            $(this).parent().next().toggle()
        }),
        $(".select .dropdown li").on("click", function () {
            $(this).parent().toggle();
            var t = $(this).attr("rel");
            $(this).parent().prev().find("div").text(t)
        }),
        $(".step-box-content ").on("click", function () {
            var t = $(this).attr("data-id");
            $(".step-box-content").removeClass("active"),
                $(this).addClass("active"),
                $("#wizard .type").val(t)
        }),
        $(".services-select-option li").on("click", function () {
            $(".services-select-option li").removeClass("active"),
                $(this).addClass("active")
        }),
        $(".opti-list ul li").on("click", function (t) {
            $(this).find("input[type=checkbox]").prop("checked", !
                $(this).find("input[type=checkbox]").prop("checked")),
                $(this).hasClass("active") ? $(this).removeClass("active") :
                    $(this).addClass("active")
        }),
        $("input[type=checkbox]").click(function (t) {
            return t.stopPropagation(), !0
        }),
        $(".plan-icon-text").on("click", function () {
            $(this).find("input[type=radio]").prop("checked", !0),
                $(".plan-icon-text").removeClass("active"),
                $(this).addClass("active")
        });
    let t = {
        stepsBtnClass: "multisteps-form__progress-btn",
        stepsBtns: document.querySelectorAll(".multisteps-form__progress-btn"),
        stepsBar: document.querySelector(".multisteps-form__progress"),
        stepsForm: document.querySelector(".multisteps-form__form"),
        stepFormPanelClass: "multisteps-form__panel",
        stepFormPanels: document.querySelectorAll(".multisteps-form__panel"),
        stepPrevBtnClass: "js-btn-prev",
        stepNextBtnClass: "js-btn-next"
    }, e = (t, e) => {
        t.forEach(t => {
            t.classList.remove(e)
        })
    }, s = (t, e) => {
        let s = t;
        for (; !s.classList.contains(e);) s = s.parentNode;
        return s
    }, n = e => Array.from(t.stepsBtns).indexOf(e), i = s => {
        e(t.stepsBtns, "js-active"), e(t.stepsBtns, "current"), t.stepsBtns.forEach((t, e) => {
            e <= s && (t.classList.add("js-active"), $(t).addClass(e)), e == s && t.classList.add("current")
        })
    }, o = () => {
        let e;
        return t.stepFormPanels.forEach(t => {
            t.classList.contains("js-active") && (e = t)
        }), e
    }, a = s => {
        let n = $(t.stepFormPanels, "js-active").attr("data-animation");
        e(t.stepFormPanels, "js-active"), e(t.stepFormPanels, n), e(t.stepFormPanels, "animate__animated"), t.stepFormPanels.forEach((i, o) => {
            o === s && (i.classList.add("js-active"), i.classList.add("animate__animated", n), setTimeout(function () {
                e(t.stepFormPanels, "animate__animated", n)
            }, 1200), l(i))
        })
    }, r = e => {
        let s = e.offsetHeight;
        t.stepsForm.style.height = `${s}px`
    }, l = () => {
        let t = o();
        r(t)
    };
    t.stepsBar.addEventListener("click", e => {
        let s = e.target;
        s.classList.contains(`${t.stepsBtnClass}`) && n(s)
    }), t.stepsForm.addEventListener("click", e => {
        let n = e.target;
        if (!(n.classList.contains(`${t.stepPrevBtnClass}`) || n.classList.contains(`${t.stepNextBtnClass}`))) return;
        let o = s(n, `${t.stepFormPanelClass}`), r = Array.from(t.stepFormPanels).indexOf(o);
        if (n.classList.contains(`${t.stepPrevBtnClass}`)) i(--r), a(r); else if (n.classList.contains(`${t.stepNextBtnClass}`)) {
            var l = $(".multisteps-form__panel.js-active"), c = !0, p = l.data("id");
            if (1 == p) {
                if ("" == $("#modal_registration").find("#type").val()) return swal.fire({
                    title: "",
                    text: "يرجى اختيار نوع التسجيل ",
                    icon: "error",
                    showCancelButton: !1,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "اغلاق",
                    closeOnConfirm: !0,
                    closeOnCancel: !0
                }), c = !1, !1;
                $("#modal_registration #button_next").removeClass("d-none"),
                    $("#modal_registration #button_submit").addClass("d-none")
            }
            if (2 == p) {
                if ("" == $("#modal_registration").find("#name").val()) return swal.fire({
                    title: "",
                    text: "يرجى ادخال الاسم   ",
                    icon: "error",
                    showCancelButton: !1,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "اغلاق",
                    closeOnConfirm: !0,
                    closeOnCancel: !0
                }), c = !1, !1;
                if ("" == $("#modal_registration").find("#email").val()) return swal.fire({
                    title: "",
                    text: "يرجى ادخال البريد الالكتروني  ",
                    icon: "error",
                    showCancelButton: !1,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "اغلاق",
                    closeOnConfirm: !0,
                    closeOnCancel: !0
                }), c = !1, !1;
                if ("" == $("#modal_registration").find("#pass").val()) return swal.fire({
                    title: "",
                    text: "يرجى ادخال كلمة المرور   ",
                    icon: "error",
                    showCancelButton: !1,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "اغلاق",
                    closeOnConfirm: !0,
                    closeOnCancel: !0
                }), c = !1, !1
            }
            !0 === c && ($("html, body").animate({scrollTop: 0}, 600), i(++r), a(r))
        }
    }), window.addEventListener("load", l, !0), window.addEventListener("resize", l, !0)
});
