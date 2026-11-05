@extends('emails.layout')

@push('page-title',trans('app.title_order_mail'))
@push('css')
    <style>
        table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }
        td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
        }

        tr:nth-child(even) {
            background-color: #dddddd;
        }
    </style>
@endpush

@section('content')
    <h4>{{trans_app('orders_details')}}</h4>
    <table style="width: 100%;">
        <tbody>
        <tr>
            <td>Order ID</td>
            <td>{{$order->show_id}}</td>
        </tr>
        <tr>
            <td>Order Date</td>
            <td>{{$order->created_at}}</td>
        </tr>
        </tbody>
    </table>
    <br>
    <hr>
    <br>

    <h4>Account Information</h4>
    <table style="width: 100%;">
        <tbody>
        <tr>
            <td>Customer Name</td>
            <td>{{ $order->user->full_name }}</td>
        </tr>
        <tr>
            <td>Customer Email</td>
            <td>{{ $order->user->email }}</td>
        </tr>
        <tr>
            <td>Customer phone</td>
            <td>{{ $order->user->mobile }}</td>
        </tr>
        </tbody>
    </table>
    <br>
    <hr>
    <br>
    <h5>Transaction Details </h5>
    <table style="width: 100%;">
        <tbody>
        <tr>
            <td>Payment Method</td>
            <td>{{ isset($order->paymentMethod) ? $order->paymentMethod->name : ''}}</td>
        </tr>
        <tr>
            <td>Transaction ID</td>
            <td>{{ isset($order->transaction) ? $order->transaction->transaction_id : ''}}</td>
        </tr>
        </tbody>
    </table>
    <br>
    <hr>
    <br>

    <h5>Courses Ordered</h5>
    <table class="table">
        <thead>
        <tr>
            <th>Course</th>
            <th>Unit Price</th>
            <th>Quantity</th>
            <th>Line Total</th>
        </tr>
        </thead>
        <tbody>
        @if(isset($order->courses) && count($order->courses) > 0)
            @foreach($order->courses as $course)
                <tr>
                    <th scope="row">{{ $course->course->name }}</th>
                    <td>{{ $course->unit_price }}</td>
                    <td>{{ $course->qty }}</td>
                    <td>{{ $course->line_total }}</td>
                </tr>
            @endforeach
        @endif
        </tbody>
    </table>
    <br>
    <hr>
    <br>

    <table style="width:30%; float: right;">
        <tr>
            <td>Subtotal</td>
            <td>{{$order->sub_total}}</td>
        </tr>

        <tr>
            <td>Discount</td>
            <td>{{$order->discount ? $order->discount : 0.00}}</td>
        </tr>
        <tr>
            <td>Tax</td>
            <td>{{$order->tax}}</td>
        </tr>
        <tr>
            <td>Total</td>
            <td>{{$order->total}}</td>
        </tr>
    </table>

    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <hr>

@endsection
