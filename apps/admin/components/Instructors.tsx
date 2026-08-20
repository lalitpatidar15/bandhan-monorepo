'use client';

import { useMemo, useState } from 'react';
import { Search, Star, BookOpen, Users, MessageSquare, ChevronDown, ChevronUp, Shield, ShieldOff, Eye, Mail, Clock3, ExternalLink } from 'lucide-react';
import { useGetInstructorsDetailedQuery, useGetInstructorReviewsQuery, useUpdateInstructorStatusMutation } from '@/lib/adminApi';
import { statusBadgeClass } from '@/lib/badges';

export default function Instructors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: instructors = [], isLoading } = useGetInstructorsDetailedQuery();
  const [updateStatus] = useUpdateInstructorStatusMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter(i => [i.fullName, i.email, i.headline].join(' ').toLowerCase().includes(q));
  }, [searchTerm, instructors]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleVerify = async (id: string, current: boolean) => {
    try { await updateStatus({ id, isVerified: !current }).unwrap(); } catch (e) { console.error(e); }
  };

  const handleToggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'blocked' : 'active';
    if (!confirm(`Set instructor to ${next}?`)) return;
    try { await updateStatus({ id, accountStatus: next }).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Instructors</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search instructors..." className="admin-input pl-8 w-56" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-8 text-center text-sm text-gray-500">No instructors found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <div key={i._id} className="card overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(i._id)}
              >
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {i.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">{i.fullName}</span>
                    {i.isVerified && <Shield className="w-3 h-3 text-blue-500 fill-blue-100" />}
                    <span className={`admin-badge text-[10px] ${statusBadgeClass(i.accountStatus)}`}>{i.accountStatus}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{i.headline || i.email}</div>
                </div>

                <div className="flex items-center gap-5 text-xs text-gray-600 shrink-0">
                  <div className="flex items-center gap-1" title="Average Rating">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{i.avgRating || '—'}</span>
                    <span className="text-gray-400">({i.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1" title="Courses">
                    <BookOpen className="w-3 h-3 text-purple-500" />
                    <span>{i.totalCourses}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Students">
                    <Users className="w-3 h-3 text-green-600" />
                    <span>{i.totalStudents}</span>
                  </div>
                  <div className="text-gray-400">{i.profileCompletion}%</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleVerify(i._id, i.isVerified); }}
                    className={`admin-btn text-[10px] ${i.isVerified ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                    title={i.isVerified ? 'Unverify' : 'Verify'}
                  >
                    {i.isVerified ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(i._id, i.accountStatus); }}
                    className={`admin-btn text-[10px] ${i.accountStatus === 'active' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                    title={i.accountStatus === 'active' ? 'Block' : 'Activate'}
                  >
                    {i.accountStatus === 'active' ? 'Block' : 'Activate'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(i._id); }}
                    className="admin-btn admin-btn-secondary text-[10px]"
                    aria-expanded={expandedId === i._id}
                  >
                    <Eye className="w-3 h-3" /> Details
                  </button>
                  {expandedId === i._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {expandedId === i._id && (
                <>
                  <InstructorDetails instructor={i} />
                  <InstructorReviews instructorId={i._id} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InstructorDetails({ instructor }: { instructor: import('@/lib/adminApi').AdminInstructorDetailed }) {
  const verifiedDocuments = Object.entries(instructor.verificationStatus)
    .filter(([, status]) => status)
    .map(([name, status]) => `${name.replace(/([A-Z])/g, ' $1')}: ${status}`);
  const joined = instructor.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(instructor.createdAt)) : '—';
  const lastLogin = instructor.lastLogin ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(instructor.lastLogin)) : 'Never';

  return (
    <div className="border-t bg-slate-50 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Instructor profile details</h2>
        <span className={`admin-badge ${instructor.isVerified ? 'admin-badge-active' : 'admin-badge-pending'}`}>
          {instructor.isVerified ? 'Verified instructor' : 'Verification pending'}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-xs">
        <DetailCard title="Contact">
          <DetailLine icon={<Mail className="h-3 w-3" />} label="Email" value={instructor.email} />
          <DetailLine label="Email verified" value={instructor.isEmailVerified ? 'Yes' : 'No'} />
          <DetailLine icon={<Clock3 className="h-3 w-3" />} label="Joined" value={joined} />
          <DetailLine label="Last login" value={lastLogin} />
        </DetailCard>
        <DetailCard title="Profile & expertise">
          <DetailLine label="Headline" value={instructor.headline || 'Not provided'} />
          <DetailLine label="Expertise" value={instructor.expertiseTags.join(', ') || 'Not provided'} />
          <DetailLine label="Languages" value={instructor.languages.join(', ') || 'Not provided'} />
          <DetailLine label="Profile completion" value={`${instructor.profileCompletion}%`} />
        </DetailCard>
        <DetailCard title="Verification">
          <DetailLine label="Documents submitted" value={instructor.isDocumentSubmitted ? `Yes (${instructor.documentCompletion}%)` : 'No'} />
          <DetailLine label="Overall status" value={instructor.verificationStatus.overall || 'pending'} />
          <DetailLine label="Checks" value={verifiedDocuments.join(' · ') || 'No document checks yet'} />
          {instructor.rejectionReason && <DetailLine label="Reason" value={instructor.rejectionReason} />}
        </DetailCard>
        <DetailCard title="Activity">
          <DetailLine label="Courses" value={String(instructor.totalCourses)} />
          <DetailLine label="Students" value={String(instructor.totalStudents)} />
          <DetailLine label="Rating" value={instructor.reviewCount ? `${instructor.avgRating}/5 (${instructor.reviewCount} reviews)` : 'No reviews'} />
          <DetailLine label="Experience" value={instructor.experience.length ? instructor.experience.map((item) => [item.title, item.company, item.years].filter(Boolean).join(' — ')).join('; ') : 'Not provided'} />
        </DetailCard>
      </div>
      {instructor.bio && <p className="mt-3 rounded-lg border bg-white p-3 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Bio: </span>{instructor.bio}</p>}
      {(instructor.linkedin || instructor.portfolio || instructor.website) && <div className="mt-3 flex flex-wrap gap-2 text-xs">{[
        ['LinkedIn', instructor.linkedin], ['Portfolio', instructor.portfolio], ['Website', instructor.website],
      ].filter(([, url]) => url).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline"><ExternalLink className="h-3 w-3" />{label}</a>)}</div>}
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border bg-white p-3"><h3 className="mb-2 font-semibold text-slate-800">{title}</h3><div className="space-y-1.5">{children}</div></section>;
}

function DetailLine({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return <div><span className="mr-1 inline-flex items-center gap-1 text-slate-500">{icon}{label}:</span><span className="break-words text-slate-800">{value}</span></div>;
}

function InstructorReviews({ instructorId }: { instructorId: string }) {
  const { data: reviews = [], isLoading } = useGetInstructorReviewsQuery(instructorId);

  if (isLoading) return <div className="px-4 py-3 border-t text-xs text-gray-500">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="px-4 py-3 border-t text-xs text-gray-500">No reviews yet</div>;

  return (
    <div className="border-t bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs font-semibold text-gray-700">Course Reviews ({reviews.length})</span>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white rounded-lg p-2.5 border text-xs">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{r.studentName}</span>
                <span className="text-gray-400">on {r.courseName}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>
            <div className="text-gray-600">{r.review}</div>
            {r.instructorResponse && (
              <div className="mt-1.5 pl-2 border-l-2 border-blue-300 text-gray-500">
                <span className="font-medium">Instructor reply:</span> {r.instructorResponse}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
