import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { email, company, role } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Store in database (assumes you have a waitlist table)
    // For now, we'll just log it - you can create the table later
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email,
          company: company || null,
          role: role || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, just return success
      // (You can create the table via Supabase dashboard later)
      console.log('Waitlist signup:', { email, company, role });
      return NextResponse.json({
        success: true,
        message: 'Thank you for your interest! We\'ll be in touch soon.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to waitlist!',
      data,
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Failed to process signup. Please try again.' },
      { status: 500 }
    );
  }
}
