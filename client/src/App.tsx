import { useEffect, useState } from "react";
import { apiFetch } from "./lib/api";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  course: string;
  status: "Active" | "Inactive";
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
}

function StatCard({ label, value, description, icon }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
          {icon}
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </article>
  );
}

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    course: "Computer Science",
    status: "Active" as "Active" | "Inactive",
  });

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.email} ${student.course}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const activeCount = students.filter(
    (student) => student.status === "Active",
  ).length;

  function openAddForm() {
    setEditingId(null);
    setError("");
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      course: "Computer Science",
      status: "Active",
    });
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setEditingId(student.id);
    setError("");
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone ?? "",
      course: student.course,
      status: student.status,
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        phone: form.phone.trim() || null,
      };

      if (editingId !== null) {
        const data = await apiFetch(`/students/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setStudents((current) =>
          current.map((student) =>
            student.id === editingId ? data.student : student,
          ),
        );
      } else {
        const data = await apiFetch("/students", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setStudents((current) => [data.student, ...current]);
      }

      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save student.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) return;

    setError("");

    try {
      await apiFetch(`/students/${id}`, {
        method: "DELETE",
      });

      setStudents((current) => current.filter((student) => student.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete student.",
      );
    }
  }

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await apiFetch("/students");
        setStudents(data.students);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load students.",
        );
      }
    }

    loadStudents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white p-5 md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
        <a href="#dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
            S
          </span>
          <span className="text-xl font-bold tracking-tight">
            Student<span className="text-blue-600">Hub</span>
          </span>
        </a>

        <p className="mb-3 mt-9 text-xs font-semibold tracking-widest text-slate-400">
          MAIN MENU
        </p>

        <a
          href="#dashboard"
          className="rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
        >
          ▦ &nbsp; Dashboard
        </a>

        <a
          href="#Students"
          className="mt-2 rounded-xl px-4 py-3 font-medium text-slate-600 hover: bg-slate-50"
        >
          ♙ &nbsp; Students
        </a>

        <button
          type="type"
          onClick={openAddForm}
          className="mt-2 rounded-xl px-4 py-3 text-left font-medium text-slate-600 hover: bg-slate-50"
        >
          ＋ &nbsp; Register Student
        </button>

        <div className="mt-8 rounded-2xl bg-blue-50 p-4">
          <p className="font-semibold text-blue-900 ">
            Student records made easy
          </p>
          <p className="mt-2  text-sm leading-6 text-slate-500">
            Manage student information from one simple dashboard.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5 md:mt-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold">Admin User</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </aside>

      <main id="dashboard" className="min-w-0 flex-1 p-5 sm:p-8 md:ml-64">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6 ">
          <div>
            <p className="text-sm text-slate-400 ">Pages / Dashboard </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            Student Portal
          </div>
        </header>

        <section className="my-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-600">
              YOUR SCHOOL AT A GLANCE
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, Admin! 👋
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Here's what's happening with your students today.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add New Student
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Students"
            value={students.length}
            description="Registered student records"
            icon="♙"
          />
          <StatCard
            label="Active Students"
            value={activeCount}
            description="Currently active"
            icon="✓"
          />
          <StatCard
            label="Inactive Students"
            value={students.length - activeCount}
            description="Not currently active"
            icon="◷"
          />
          <StatCard
            label="Courses"
            value={new Set(students.map((student) => student.course)).size}
            description="Unique courses"
            icon="▤"
          />
        </section>

        <section
          id="students"
          className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student Directory
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage your registered students.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="rounded-lg border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              + Add Student
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 px-5 pb-5 sm:flex-row sm:items-center sm:px-6">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or course..."
              aria-label="Search students"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:max-w-md"
            />

            <span className="text-sm text-slate-500">
              {filteredStudents.length} students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-400">
                    STUDENT
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-400">
                    COURSE
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-400">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wide text-slate-400">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {student.course}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          student.status === "Active"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(student)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStudent(student.id)}
                          className="rounded-lg border border-red-100 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No students found. Try another search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </section>

        <footer className="flex flex-col gap-2 py-7 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <span>© 2026 StudentHub</span>
          <span>Student Management System · Portfolio Demo</span>
        </footer>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="student-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingId !== null ? "Edit Student" : "Register Student"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Enter the student's information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg bg-slate-100 px-3 py-1 text-xl text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}
              <label className="block text-sm font-medium text-slate-700">
                First name
                <input
                  required
                  maxLength={100}
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({ ...form, firstName: event.target.value })
                  }
                  placeholder="e.g. Ada"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Last name
                <input
                  required
                  maxLength={100}
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({ ...form, lastName: event.target.value })
                  }
                  placeholder="e.g. Okafor"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="student@example.com"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Course
                <select
                  value={form.course}
                  onChange={(event) =>
                    setForm({ ...form, course: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                >
                  <option>Computer Science</option>
                  <option>Software Engineering</option>
                  <option>Information Technology</option>
                  <option>Data Science</option>
                  <option>Cybersecurity</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Register Student"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
