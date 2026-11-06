<contact-us-form inline-template>
    <div class="contact-form" style="background-image:url();" v-loading="form.loadingDisplay">
        <form id="contactus" method="POST" role="form" class="formContact contactForm">
            <div class="form-group">
                <h4 class="text-center">تواصل معنا</h4>
            </div>
            <div class="form-group">
                <label for="title">الاسم</label>
                <input type="text" v-model="name" required class="form-control" id="title" placeholder="أدخل الاسم الذي تريد التواصل به" name="title">
                <span v-if="form.validation && form.validation.name" class="error-block">@{{ form.validation.name[0] }}</span>
            </div>
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" v-model="email" required class="form-control" id="email" placeholder="info@email.com" name="email">
                <span v-if="form.validation && form.validation.email" class="error-block">@{{ form.validation.email[0] }}</span>
            </div>
            <div class="form-group">
                <label for="content">الرسالة</label>
                <textarea required v-model="message" id="content" name="content" class="form-control"></textarea>
                <span v-if="form.validation && form.validation.message" class="error-block">@{{ form.validation.message[0] }}</span>
            </div>

            <button type="button" @click="save" :disabled="form.disabledButton" class="btn btn-primary">إرسال</button>
        </form>
        <div class="overlay"></div>
    </div>
</contact-us-form>
