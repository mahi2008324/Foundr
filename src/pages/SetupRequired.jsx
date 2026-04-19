import { firebaseConfigError } from '../services/firebase'

export default function SetupRequired() {
  return (
    <div className="page-enter flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-2xl rounded-[2rem] border border-indigo-100 bg-white p-10 shadow-[0_18px_60px_rgba(79,70,229,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-600">Setup required</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
          Foundr needs your Firebase configuration before it can render.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Create a local `.env` file from `.env.example`, add your Firebase project values, then restart the Vite dev server.
        </p>
        <div className="mt-6 rounded-2xl bg-slate-950 p-4 text-sm text-white">
          {firebaseConfigError}
        </div>
        <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-slate-700">
          Required next step: copy `.env.example` to `.env` and fill in your actual Firebase keys.
        </div>
      </div>
    </div>
  )
}
