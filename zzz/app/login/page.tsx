"use client"

import { supabase } from "@/lib/supabase"

export default function LoginPage() {
    const signIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/dashboard` }
        })
    }

    return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"var(--bg)", position:"relative", overflow:"hidden" }}>

            {/* Grid background */}
            <div style={{
                position:"fixed", inset:0, opacity:.025,
                backgroundImage:"linear-gradient(var(--border-2) 1px, transparent 1px), linear-gradient(90deg, var(--border-2) 1px, transparent 1px)",
                backgroundSize:"48px 48px", pointerEvents:"none"
            }}/>

            {/* Glow */}
            <div style={{
                position:"fixed", top:"-20%", left:"50%", transform:"translateX(-50%)",
                width:480, height:480,
                background:"radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
                pointerEvents:"none"
            }}/>

            <div className="fade-up" style={{ width:"100%", maxWidth:360, position:"relative" }}>

                {/* Brand */}
                <div style={{ textAlign:"center", marginBottom:40 }}>
                    <div style={{
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        width:44, height:44, borderRadius:12, background:"var(--accent)",
                        marginBottom:16, fontSize:20
                    }}>⚡</div>
                    <div style={{ fontSize:22, fontWeight:800, letterSpacing:"-0.02em", marginBottom:6 }}>LinkVault</div>
                    <div style={{ fontSize:13, color:"var(--text-muted)", fontWeight:400 }}>Your personal link library</div>
                </div>

                {/* Card */}
                <div style={{
                    background:"var(--surface)", border:"1px solid var(--border)",
                    borderRadius:"var(--radius-lg)", padding:"32px 28px"
                }}>
                    <div style={{ fontWeight:600, fontSize:15, marginBottom:6 }}>Welcome back</div>
                    <div style={{ color:"var(--text-muted)", fontSize:12, marginBottom:28, fontWeight:400 }}>Sign in to continue to your links</div>

                    <button
                        onClick={signIn}
                        style={{
                            width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                            padding:"12px 16px", borderRadius:"var(--radius)", cursor:"pointer",
                            background:"var(--surface-2)", border:"1px solid var(--border-2)",
                            color:"var(--text)", fontWeight:500, fontSize:13, transition:"all .15s ease"
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-2)", e.currentTarget.style.background = "var(--surface-3)")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-2)", e.currentTarget.style.background = "var(--surface-2)")}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink:0 }}>
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>

                <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:"var(--text-muted)", fontWeight:400 }}>
                    Free to use · No credit card required
                </div>
            </div>
        </div>
    )
}
