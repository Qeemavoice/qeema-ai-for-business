<?php

namespace App\Http\Controllers\Upload;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UploadFileController extends Controller
{
    use UploadTrait;

    public function __construct()
    {
        $this->middleware('un.auth')->except('uploadFile');
        $this->middleware('throttle:4,1');
    }

    public function uploadFileOnCrop(Request $request, $dir)
    {
        $request->validate([
            'img' => $this->imageRules(true)
        ]);

        $file = $request->file('img');


        $image = $this->saveFile($file, $dir);

        $name = basename($image);
        return [
            "location" => basename($image),
            'file_url' => $this->getPathFile($dir, $name),
        ];
    }

    public function uploadFile(Request $request)
    {
        $dir = $request->dir;

        $validator = Validator::make($request->all(), $this->validateFile($dir, $request->file_type));

        if ($validator->fails()) {
            return $this->successResponse(false, $validator->errors()->first());
        }


        if ($request->hasFile('file')) {

            $file = $request->file('file');

            $OriginalName = $file->getClientOriginalName();
            $size = $file->getSize();
            $mimeType = $file->getClientMimeType();

            $file = $this->saveFile($file, $dir);

            $name = basename($file);

            return response()->json([
                'location' => $this->getPathFile($dir, $name),
                'url' => $this->getPathFile($dir, $name),
                'file_link' => $name,
                'name' => $OriginalName,
                'size' => $size,
                'mimeType' => $mimeType,
                'path' => DIR_UPLOAD . '/' . $dir . '/' . $name,
            ], 200);
        }
    }

    function ckeditorUploadImg(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'upload' => 'required|image|mimes:png,jpg,jpeg',
        ], [], [
            'upload' => 'file',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->messages(), 422);
        }

        $path = $this->saveFile($request->file('upload'), 'ckeditor_uploads');
        $name = $request->file('upload')->getClientOriginalName();
        return ['uploaded' => true, 'fileName' => $name, 'url' => $this->getPathFile('ckeditor_uploads', $path),];
    }


}
