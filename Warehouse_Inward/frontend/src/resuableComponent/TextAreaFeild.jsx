export const TextAreaField = ({ label, name, value, onChange, placeholder, required = false }) => (
  <div className="md:col-span-2">
    <label className="block text-gray-700 font-medium mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows="3"
      required={required}
      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
    />
  </div>
);