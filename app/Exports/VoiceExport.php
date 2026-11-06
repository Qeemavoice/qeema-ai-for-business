<?php

namespace App\Exports;

use App\Http\Resources\AdminPanel\Exports\GenerateVoiceExportResources;
use App\Models\Voice;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class VoiceExport implements FromCollection, WithHeadings, WithEvents, WithColumnWidths, WithStyles
{

    public function collection()
    {
        $voices = Voice::with('voiceOver')->get();
        return GenerateVoiceExportResources::collection($voices);
    }


    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Type',
            'Price per minute',
            'Total price',
            'Voiceover',
            'Category',
            'Dialect',
            'Created at',
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                // All headers - set font size to 14
                $cellRange = 'A1:Z1';
                $event->sheet->getDelegate()->getStyle($cellRange)->getFont()->setSize(11);

                // Set first row to height 20
                $event->sheet->getDelegate()->getRowDimension(1)->setRowHeight(20);

            },
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 10,
            'B' => 30,
            'C' => 10,
            'D' => 15,
            'E' => 10,
            'F' => 25,
            'G' => 20,
            'H' => 20,
            'I' => 30,
            'J' => 25,
            'K' => 25,
            'L' => 30,
            'M' => 30,
            'N' => 30,
            'O' => 30,
            'P' => 15,
            'Q' => 30,
            'R' => 30,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}
