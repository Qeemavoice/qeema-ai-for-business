<?php

namespace Tests\Feature;

use App\Services\NewUi\Tts;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Studio voices get a fixed Qeema code (QV-101…) that maps back to the voice */
class VoiceCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_codes_are_stable_unique_and_resolve_back()
    {
        $a = Tts::code('voice-ai-1');
        $b = Tts::code('munsit:abc123');
        $this->assertSame('QV-101', $a);
        $this->assertSame('QV-102', $b);
        $this->assertSame($a, Tts::code('voice-ai-1'));      // same voice, same code
        $this->assertSame('munsit:abc123', Tts::idFromCode('qv-102'));
        $this->assertNull(Tts::idFromCode('QV-999'));
        $this->assertNull(Tts::idFromCode('voice-ai-1'));
        $this->assertNull(Tts::munsitVoiceRow('voice-ai-1')); // not a Munsit voice: no call to Munsit
    }
}
