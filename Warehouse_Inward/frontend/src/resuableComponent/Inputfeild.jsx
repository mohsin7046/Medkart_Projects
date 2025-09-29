export const InputField = ({ label, name, type = "text", value, onChange, required = false, readOnly = false, placeholder }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      required={required}
      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
    />
  </div>
);