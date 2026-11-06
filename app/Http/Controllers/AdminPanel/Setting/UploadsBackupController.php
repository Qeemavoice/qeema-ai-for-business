<?php


namespace App\Http\Controllers\AdminPanel\Setting;


use App\Http\Controllers\AdminPanel\CoreController;
use App\Http\Controllers\Controller;
use ZipArchive;

class UploadsBackupController extends Controller
{
    public function downloadVoices()
    {
        $folderPath = public_path('uploads/voices');
        $zipPath = storage_path('app/voices.zip');

        // حذف الملف القديم إن وجد
        if (file_exists($zipPath)) {
            unlink($zipPath);
        }

        $zip = new \ZipArchive;

        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {

            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($folderPath),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                if (!$file->isDir()) {

                    $filePath = $file->getRealPath();

                    // المسار النسبي بالنسبة لمجلد voices
                    $relativePath = substr(
                        $filePath,
                        strlen($folderPath) + 1
                    );

                    $zip->addFile($filePath, $relativePath);
                }
            }

            $zip->close();
        }

        return response()
            ->download($zipPath, 'voices.zip')
            ->deleteFileAfterSend(true);
    }
}
