import Link from "next/link";

const TrophyIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="w-full h-full"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v3.375m9 0ZM9 18.75V10.5m-3.75 3h7.5M12 3a9 9 0 0 1 9 9m-18 0a9 9 0 0 1 9-9Z"
		/>
	</svg>
);

const MOCK_LEADERBOARD = [
	{ rank: 1, name: "Diego Maradona", pts: 127 },
	{ rank: 2, name: "Leo Messi", pts: 115 },
	{ rank: 3, name: "Ronaldo Nazario", pts: 98 },
	{ rank: 4, name: "Pelé", pts: 91 },
	{ rank: 5, name: "Zidane", pts: 84 },
];

const SCORING_RULES = [
	{
		pts: "3",
		title: "Resultado exacto",
		desc: "Ej: Predijiste 2-1, terminó 2-1",
		className: "bg-amber-500/10 border-amber-500/20",
		numClass: "bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950",
		titleClass: "text-amber-300",
	},
	{
		pts: "1",
		title: "Resultado correcto",
		desc: "Ej: Predijiste 2-1, terminó 3-1",
		className: "bg-slate-800/60 border-slate-700/50",
		numClass: "bg-slate-700 text-white",
		titleClass: "text-slate-200",
	},
	{
		pts: "0",
		title: "Resultado incorrecto",
		desc: "Ej: Predijiste 2-1, terminó 1-2",
		className: "bg-slate-900/60 border-slate-800/50",
		numClass: "bg-slate-800 text-slate-500",
		titleClass: "text-slate-400",
	},
];

const HOW_IT_WORKS = [
	{
		step: "1",
		title: "Pronosticá",
		desc: "Ingresá el marcador que creés que terminará cada partido antes del comienzo.",
		glow: "bg-amber-500/5",
		cardClass: "from-amber-400/20 to-yellow-600/20 border-amber-500/20",
		numClass: "text-amber-400",
	},
	{
		step: "2",
		title: "Sumá puntos",
		desc: (
			<>
				Ganás <span className="text-amber-400 font-bold">3 pts</span> si acertás
				el marcador exacto, o{" "}
				<span className="text-slate-200 font-semibold">1 pt</span> por acertar
				el ganador.
			</>
		),
		glow: "bg-indigo-500/5",
		cardClass: "from-indigo-400/20 to-sky-600/20 border-indigo-500/20",
		numClass: "text-indigo-400",
	},
	{
		step: "3",
		title: "Subí en el ranking",
		desc: "Competí contra otros jugadores y escalá en la tabla de posiciones global.",
		glow: "bg-emerald-500/5",
		cardClass: "from-emerald-400/20 to-green-600/20 border-emerald-500/20",
		numClass: "text-emerald-400",
	},
];

export default function HomePage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
			{/* Ambient glows */}
			<div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[130px] pointer-events-none" />
			<div className="absolute top-[35%] right-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-500/8 blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

			{/* ─── Navbar ─── */}
			<nav className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-12 max-w-6xl mx-auto">
				<div className="flex items-center gap-2.5">
					<div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] p-2">
						<TrophyIcon />
					</div>
					<span className="font-extrabold tracking-tight text-white text-sm">
						MUNDIAL PRODE
					</span>
				</div>
				<Link
					href="/login"
					className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-sm hover:from-amber-400 hover:to-yellow-500 transition-all duration-200 shadow-[0_4px_12px_rgba(245,158,11,0.25)] active:scale-[0.98]"
				>
					Ingresar
				</Link>
			</nav>

			{/* ─── Hero ─── */}
			<section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 sm:pt-24 max-w-4xl mx-auto">
				<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-8">
					<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
					Mundial 2026 en vivo
				</div>

				<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_40px_rgba(245,158,11,0.3)] mb-7 p-5">
					<TrophyIcon />
				</div>

				<h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent leading-none mb-6">
					MUNDIAL
					<br />
					PRODE
				</h1>

				<p className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed mb-4">
					Pronosticá los resultados del Mundial y competí con tus amigos en
					tiempo real.
				</p>
				<p className="text-sm text-slate-500 max-w-md mb-10">
					Ingresá tus predicciones antes de cada partido, acumulá puntos y
					escalá en la tabla de posiciones.
				</p>

				<div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none justify-center">
					<Link
						href="/login"
						className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-base hover:from-amber-400 hover:to-yellow-500 transition-all duration-200 shadow-[0_6px_20px_rgba(245,158,11,0.3)] active:scale-[0.98]"
					>
						Comenzar ahora →
					</Link>
					<Link
						href="/login"
						className="px-8 py-4 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800 text-slate-200 font-semibold text-base hover:bg-slate-800/60 transition-all duration-200"
					>
						Ver demo
					</Link>
				</div>
			</section>

			{/* ─── Stats bar ─── */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 mb-20">
				<div className="grid grid-cols-3 gap-3 sm:gap-4">
					{[
						{ value: "48", label: "Partidos", symbol: "⚽" },
						{ value: "3 pts", label: "Por exacto", symbol: "🎯" },
						{ value: "1 pt", label: "Por acierto", symbol: "✓" },
					].map((stat) => (
						<div
							key={stat.label}
							className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800/60"
						>
							<span className="text-base sm:text-lg">{stat.symbol}</span>
							<span className="text-xl sm:text-2xl font-black text-amber-400">
								{stat.value}
							</span>
							<span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">
								{stat.label}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* ─── How it works ─── */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 mb-24">
				<h2 className="text-2xl font-extrabold text-white text-center mb-2">
					¿Cómo funciona?
				</h2>
				<p className="text-sm text-slate-500 text-center mb-10">
					Tres pasos simples para competir
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
					{HOW_IT_WORKS.map((item) => (
						<div
							key={item.step}
							className="relative p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 overflow-hidden hover:border-amber-500/30 transition-all duration-300"
						>
							<div
								className={`absolute top-0 right-0 w-32 h-32 ${item.glow} rounded-full blur-2xl -translate-y-8 translate-x-8`}
							/>
							<div
								className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.cardClass} border flex items-center justify-center mb-4 ${item.numClass} text-xl font-black`}
							>
								{item.step}
							</div>
							<h3 className="text-base font-bold text-white mb-2">
								{item.title}
							</h3>
							<p className="text-sm text-slate-400 leading-relaxed">
								{item.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* ─── Scoring system ─── */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 mb-24">
				<div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/80 to-indigo-950/40 backdrop-blur-xl border border-slate-800 overflow-hidden">
					<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
					<div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />

					<div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
						<div className="flex-1">
							<span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block">
								Sistema de puntuación
							</span>
							<h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
								Cada partido es una oportunidad de brillar
							</h2>
							<p className="text-sm text-slate-400">
								Cuanto más preciso seas, más puntos acumulás. El que mejor
								predice, gana.
							</p>
						</div>

						<div className="flex flex-col gap-3 w-full sm:w-auto sm:min-w-[240px]">
							{SCORING_RULES.map((rule) => (
								<div
									key={rule.pts}
									className={`flex items-center gap-4 p-4 rounded-2xl border ${rule.className}`}
								>
									<div
										className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${rule.numClass}`}
									>
										{rule.pts}
									</div>
									<div>
										<p className={`text-sm font-bold ${rule.titleClass}`}>
											{rule.title}
										</p>
										<p className="text-xs text-slate-500">{rule.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ─── Leaderboard preview ─── */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 mb-24">
				<h2 className="text-2xl font-extrabold text-white text-center mb-2">
					Tabla de posiciones
				</h2>
				<p className="text-sm text-slate-500 text-center mb-10">
					¿Quién lidera el prode?
				</p>

				<div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800 overflow-hidden">
					<div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
						<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
							Participante
						</span>
						<span className="text-xs font-bold uppercase tracking-wider text-slate-400">
							Puntos
						</span>
					</div>

					<div className="divide-y divide-slate-800/40">
						{MOCK_LEADERBOARD.map((player, i) => (
							<div
								key={player.rank}
								className={`flex items-center justify-between px-6 py-4 transition-colors ${
									i === 0
										? "bg-amber-500/5 border-l-4 border-l-amber-500/50"
										: "hover:bg-slate-900/30"
								}`}
							>
								<div className="flex items-center gap-4">
									<span
										className={`w-6 text-center text-sm font-black ${i === 0 ? "text-amber-400" : "text-slate-500"}`}
									>
										{player.rank}º
									</span>
									<div
										className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold ${
											i === 0
												? "bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-500 text-slate-950"
												: "bg-slate-800 border-slate-700 text-slate-400"
										}`}
									>
										{player.name.charAt(0)}
									</div>
									<span
										className={`text-sm font-semibold ${i === 0 ? "text-white" : "text-slate-300"}`}
									>
										{player.name}
									</span>
								</div>
								<span
									className={`text-sm font-black ${i === 0 ? "text-amber-400" : "text-slate-300"}`}
								>
									{player.pts} pts
								</span>
							</div>
						))}
					</div>

					<div className="px-6 py-4 border-t border-slate-800 text-center">
						<Link
							href="/login"
							className="text-xs text-amber-400 font-semibold hover:text-amber-300 transition-colors"
						>
							Iniciá sesión para ver el ranking completo →
						</Link>
					</div>
				</div>
			</section>

			{/* ─── Final CTA ─── */}
			<section className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pb-24">
				<div className="relative p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-amber-500/20 text-center overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent" />
					<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
					<div className="absolute -bottom-16 -right-16 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />

					<div className="relative">
						<h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
							¿Listo para competir?
						</h2>
						<p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
							Unite ahora y demostrá que tenés el mejor ojo para el fútbol.
						</p>
						<Link
							href="/login"
							className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-extrabold text-base hover:from-amber-400 hover:to-yellow-500 transition-all duration-200 shadow-[0_6px_24px_rgba(245,158,11,0.35)] active:scale-[0.98]"
						>
							Empezar gratis →
						</Link>
					</div>
				</div>
			</section>

			{/* ─── Footer ─── */}
			<footer className="relative z-10 border-t border-slate-900 px-6 py-8 text-center">
				<div className="flex items-center justify-center gap-2 mb-2">
					<div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-1.5">
						<TrophyIcon />
					</div>
					<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
						Mundial Prode
					</span>
				</div>
				<p className="text-xs text-slate-600">
					Pronósticos de fútbol — Mundial 2026
				</p>
			</footer>
		</div>
	);
}
