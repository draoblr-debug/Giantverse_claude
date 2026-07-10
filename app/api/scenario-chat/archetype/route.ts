import { NextResponse } from 'next/server';
import { classify, archetypes } from '@/engines/scenario/math';
import { ARCHETYPE_DEFINITIONS } from '@/engines/archetype/archetype-definitions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentVector } = body;
    
    if (!currentVector || !Array.isArray(currentVector)) {
      return NextResponse.json({ error: 'Invalid currentVector' }, { status: 400 });
    }

    // Classify using chat engine mathematics
    const temperature = 0.05; // Final temperature
    const classification = classify(currentVector, archetypes, temperature);
    
    if (!classification.length) {
      return NextResponse.json({ error: 'No classification possible' }, { status: 400 });
    }
    
    const topChatArchetypeId = classification[0].archetypeId;
    const topCentroid = archetypes.find(a => a.id === topChatArchetypeId);
    
    const chatArchetypeName = topCentroid?.name.replace(/^The\s+/, '') || '';
    // Find the corresponding survey archetype using the label/name
    const surveyArchetype = Object.values(ARCHETYPE_DEFINITIONS).find(
      (a) => a.label === chatArchetypeName
    );

    if (!surveyArchetype) {
      return NextResponse.json({ error: 'Could not map to a known archetype.' }, { status: 400 });
    }

    // Map probabilities to survey archetype IDs
    const scores = classification.map(c => {
      const centroid = archetypes.find(a => a.id === c.archetypeId);
      const cName = centroid?.name.replace(/^The\s+/, '') || '';
      const mapped = Object.values(ARCHETYPE_DEFINITIONS).find(a => a.label === cName);
      return {
        id: mapped?.id || c.archetypeId,
        normalized: c.probability
      };
    });

    return NextResponse.json({
      topArchetype: {
        id: surveyArchetype.id,
        label: surveyArchetype.label,
        romajiName: surveyArchetype.romajiName,
        order: surveyArchetype.order,
        normalized: classification[0].probability,
      },
      scores
    });

  } catch (error) {
    console.error('Scenario Chat Archetype API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
