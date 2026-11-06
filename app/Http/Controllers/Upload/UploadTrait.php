<?php


namespace App\Http\Controllers\Upload;

use Illuminate\Support\Facades\File;


trait UploadTrait
{
    private function imageRules($required = false, $maxSize = MAX_SIZE_UPLOAD_FILE): array
    {
        return [
            $required ? 'required' : 'nullable',
            'image', 'max:' . $maxSize,
            'mimes:jpeg,png,jpg'
        ];
    }

    private function validateFile($type, $file_type = 'image')
    {
        $MAX_SIZE_UPLOAD_FILE = MAX_SIZE_UPLOAD_FILE;
        $mimesImage =  MIMES_IMAGE ;
        $mimesDocuments = MIMES_DOCUMENTS;
        $mimesExcel = MIMES_EXCEL;
        $mimesPowerPoint = MIMES_POWERPOINT;
        $mimesZip = MIMES_ZIP;
        $mimesVideo = MIMES_VIDEO;
        $mimesMp4 = MIMES_mp4;

        $mimes = MIMES_all;
        if($file_type == 'image') {
            $mimes = $mimesImage;
        }elseif ($file_type == 'documents'){
            $mimes = $mimesDocuments;
        }elseif ($file_type == 'video'){
            $mimes = $mimesMp4;
        }


        switch ($type) {
            case 'temp':
                return ['file' => 'required|max:' . $MAX_SIZE_UPLOAD_FILE . '|mimes:' . $mimes];
                break;
            default:
                return [
                    'file' => 'required|max:10096',
                ];
        }
    }


    private function getPathFile($path, $file)
    {
        return asset_upload($path . '/' . $file);
    }

    private function saveFile($file, $direction)
    {
        $mime = $file->getClientOriginalExtension();
        $path = my_public() . DIR_UPLOAD . DIRECTORY_SEPARATOR . $direction;
        File::exists($path) or File::makeDirectory($path, 0755, true);
        $file_name = rand(100, 9999999) . '.' . $mime;
        $file->move($path, $file_name);
        return $file_name;
    }

}
