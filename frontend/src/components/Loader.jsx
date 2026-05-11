import { motion } from "framer-motion";

export default function Loader({ message = "Processing..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-blue-500/20 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        className="mt-6 text-slate-400 font-medium tracking-wide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
