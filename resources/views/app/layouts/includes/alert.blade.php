<script>
    @if (session()->has('success_message') || isset($success_message))
    @php
        $message= isset($success_message) ? $success_message : session('success_message');
    @endphp
    toastSuccess('{{$message}}');
    @endif

    @if (session()->has('error_message') || isset($error_message))
    @php
        $message= isset($success_message) ? $success_message : session('error_message');
    @endphp
    toastError('{{$message}}');
    @endif

    @if (session()->has('info_message') || isset($info_message))
    @php
        $message= isset($success_message) ? $success_message : session('info_message');
    @endphp
    toastInfo('{{$message}}');
    @endif

    @if (session()->has('warning_message') || isset($warning_message))
    @php
        $message= isset($success_message) ? $success_message : session('warning_message');

    @endphp
    toastWarning(`{{$message}}`);
    @endif

    @if (session()->has('default_message') || isset($default_message))
    @php
        $message= isset($success_message) ? $success_message : session('default_message');
    @endphp
    toastDefault('{{$message}});
    @endif

</script>
