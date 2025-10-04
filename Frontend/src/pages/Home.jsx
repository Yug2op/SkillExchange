import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
      <section className="container mx-auto px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <motion.h1
            className="text-4xl font-bold tracking-tight sm:text-5xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Learn and Teach Skills,
            <span className="text-primary"> Together</span>.
          </motion.h1>

          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Find perfect matches: share what you know, learn what you love.
            Real-time chat, session scheduling, and community reviews.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              to="/search"
              className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90"
            >
              Explore Skills
            </Link>
            <Link
              to="/register"
              className="rounded-md border px-5 py-2.5 hover:bg-accent"
            >
              Join Now
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="rounded-xl border p-6 bg-card shadow-sm"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Feature title="Smart Matches" desc="Get paired with users based on skills you teach and learn." />
            <Feature title="Real-time Chat" desc="Message instantly and see typing indicators and notifications." />
            <Feature title="Session Scheduling" desc="Schedule sessions (online/offline) with time slots." />
            <Feature title="Trust & Reviews" desc="Public reviews and ratings help build trust." />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}