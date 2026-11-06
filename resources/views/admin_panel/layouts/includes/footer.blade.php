<div class="footer py-4 d-flex flex-lg-column" id="kt_footer">
    <div class="container-fluid d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div class="text-dark order-2 order-md-1">
            <span class="text-muted fw-bold me-1">{{ app_name() }} ©{{ date('Y') }}</span>
        </div>
        <ul class="menu menu-gray-600 menu-hover-primary fw-bold order-1">
            <li class="menu-item">
                <a href="mailto:alhassanfayyad@gmail.com" data-bs-trigger="hover" class="menu-link px-2"  data-bs-toggle="tooltip" data-bs-original-title="{{trans_admin('contact_the_developer_email')}}">{{trans_admin('developer')}}</a>
            </li>
            <li class="menu-item">
                <a href="https://wa.me/+972592501312" target="_blank"  class="menu-link px-2"  data-bs-toggle="tooltip" data-bs-original-title="{{trans_admin('contact_the_developer_whatsapp')}}">{{trans_admin('whatsApp')}}</a>
            </li>
        </ul>
    </div>
</div>
