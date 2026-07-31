import React from 'react';
import { Student, Materi, Penilaian } from '../../types';
import { BookOpen, Award, CheckCircle2, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProgresBelajarViewProps {
  currentStudent: Student;
  materiList: Materi[];
  penilaianList: Penilaian[];
}

export const ProgresBelajarView: React.FC<ProgresBelajarViewProps> = ({
  currentStudent,
  materiList,
  penilaianList,
}) => {
  // Category progress calculation
  const categories = ['qowaid', 'hiwar', 'kosakata', 'mahfudzot'] as const;
  const categoryNames = {
    qowaid: 'Qowaid (Tata Bahasa)',
    hiwar: 'Hiwar (Percakapan)',
    kosakata: 'Kosakata (Mufradat)',
    mahfudzot: 'Mahfudzot (Kata Mutiara)',
  };

  const chartData = categories.map(cat => {
    const totalInCat = materiList.filter(m => m.category === cat).length || 1;
    const completedInCat = materiList.filter(
      m => m.category === cat && currentStudent.completedMaterials.includes(m.id)
    ).length;
    const pct = Math.round((completedInCat / totalInCat) * 100);

    return {
      category: categoryNames[cat],
      Selesai: completedInCat,
      Total: totalInCat,
      Persentase: pct,
    };
  });

  const totalMaterials = materiList.length || 1;
  const totalCompleted = currentStudent.completedMaterials.length;
  const overallPct = Math.round((totalCompleted / totalMaterials) * 100);

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pelacakan Progres Belajar Digital</h2>
          <p className="text-xs text-slate-500">Statistik lengkap capaian modul dan hasil ujian Bahasa Arab</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">Total Capaian</span>
            <p className="text-2xl font-extrabold text-emerald-600">{overallPct}%</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center font-bold text-emerald-800 text-sm">
            {totalCompleted}/{totalMaterials}
          </div>
        </div>
      </div>

      {/* Progress per Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-600" /> Progres Per Kategori Modul
          </h3>

          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.category}</span>
                  <span>{item.Selesai}/{item.Total} Topik ({item.Persentase}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.Persentase}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Visualizer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <BarChart3 size={18} className="text-purple-600" /> Grafik Capaian Pembelajaran
          </h3>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="Persentase" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Quiz Attempt History Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award size={18} className="text-amber-500" /> Riwayat Nilai & Hasil Evaluasi Kuis
        </h3>

        {currentStudent.attempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Anda belum mengerjakan kuis atau latihan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="py-3 px-3">Judul Penilaian</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-3">Tanggal Selesai</th>
                  <th className="py-3 px-3 text-center">Nilai</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStudent.attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{att.penilaianTitle}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold">{att.penilaianType}</td>
                    <td className="py-3 px-3">{new Date(att.completedAt).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-3 text-center font-bold text-sm">
                      <span className={att.score >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                        {att.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {att.passed ? 'LULUS' : 'REMEDIAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
