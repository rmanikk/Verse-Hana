import { motion } from "framer-motion";
import vinyl from "../../../assets/vinyl.png";

function Vinyl() {
  return (
    <motion.img
      src={vinyl}
      alt="Vinyl Record"
      animate={{ rotate: 360 }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      className="
        pointer-events-none
        select-none
        drop-shadow-[0_0_60px_rgba(139,92,246,0.30)]

        h-[190px]
        w-[190px]

        sm:h-[220px]
        sm:w-[220px]

        md:h-[250px]
        md:w-[250px]

        lg:h-[275px]
        lg:w-[275px]

        xl:h-[290px]
        xl:w-[290px]
      "
    />
  );
}

export default Vinyl;