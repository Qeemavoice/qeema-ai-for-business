@extends('admin_panel.layouts.app')

@push('page-title')
    {{$pageTitle}}
@endpush

@section('content')
    <ol>
        <li><a href="{{route_admin('synContactUs')}}" target="_blank">Syn ContactUs</a></li>
        <li><a href="{{route_admin('synMailingLists')}}" target="_blank">Syn MailingLists</a></li>
        <li><a href="{{route_admin('synJobs')}}" target="_blank">Syn Jobs</a></li>
        <li><a href="{{route_admin('synCoupons')}}" target="_blank">Syn Coupons</a></li>
        <li><a href="{{route_admin('synCategories')}}" target="_blank">Syn Categories</a></li>
        <li><a href="{{route_admin('synWorks')}}" target="_blank">Syn Works</a></li>
        <li><a href="{{route_admin('synServices')}}" target="_blank">Syn Services</a></li>
        <li><a href="{{route_admin('synBanners')}}" target="_blank">Syn Banners</a></li>
        <li><a href="{{route_admin('synFaqs')}}" target="_blank">Syn Faqs</a></li>
        <li><a href="{{route_admin('synLanguages')}}" target="_blank">Syn Languages</a></li>
        <li><a href="{{route_admin('synDialects')}}" target="_blank">Syn Dialects</a></li>
        <li><a href="{{route_admin('synPartners')}}" target="_blank">Syn Partners</a></li>
        <li><a href="{{route_admin('synCustomers')}}" target="_blank">Syn Customers</a></li>
        <li><a href="{{route_admin('synClients')}}" target="_blank">Syn Clients & VoiceActors</a></li>
{{--        <li><a href="{{route_admin('synVoiceActors')}}" target="_blank">Syn VoiceActors</a></li>--}}
        <li><a href="{{route_admin('synVoicesAndSamples')}}" target="_blank">Syn  Voices And Samples</a></li>
        <li><a href="{{route_admin('synArticles')}}" target="_blank">Syn Articles</a></li>
        <li><a href="{{route_admin('synFavorites')}}" target="_blank">Syn Favorites</a></li>
        <li><a href="{{route_admin('synGuides')}}" target="_blank">Syn Guides</a></li>
        <li><a href="{{route_admin('synOrders')}}" target="_blank">Syn Orders</a></li>
        <li><a href="{{route_admin('generateWallet')}}" target="_blank">Generate Wallet</a></li>
        <li><a href="{{route_admin('synProfits')}}" target="_blank">Syn Profits</a></li>
        <li><a href="{{route_admin('synSiteSetting')}}" target="_blank">Syn Site Setting</a></li>
        <li><a href="{{route_admin('synPages')}}" target="_blank">Syn Pages</a></li>
    </ol>
@endsection
