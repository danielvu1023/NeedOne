import { ReactNode } from "react";

const InfoMessage = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="text-center w-full py-10 px-4 bg-gray-50 rounded-lg border">
    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2">{children}</p>
  </div>
);

export default InfoMessage;
