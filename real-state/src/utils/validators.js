// Comprehensive Form Validation & Deduplication Utilities for Dream Homes CRM

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: "Name is required" };
  }
  const clean = name.trim();
  if (clean.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return { isValid: false, error: "Name can only contain letters, spaces, dots, and hyphens" };
  }
  return { isValid: true, error: "" };
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: "Phone number is required" };
  }
  // Strip spaces, dashes, parentheses
  const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, "");
  
  if (!/^\d+$/.test(digitsOnly)) {
    return { isValid: false, error: "Phone number can only contain digits" };
  }

  // Handle standard 10 digit Indian mobile (starts with 6, 7, 8, 9) or 12 digit with 91 prefix
  if (digitsOnly.length === 10) {
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return { isValid: false, error: "Indian mobile numbers must start with 6, 7, 8, or 9" };
    }
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    if (!/^91[6-9]\d{9}$/.test(digitsOnly)) {
      return { isValid: false, error: "Please enter a valid 10-digit mobile number" };
    }
  } else if (digitsOnly.length < 10 || digitsOnly.length > 14) {
    return { isValid: false, error: "Phone number must be between 10 and 14 digits" };
  }

  // Check for repeated dummy numbers like 0000000000 or 1111111111
  if (/^(\d)\1{9,}$/.test(digitsOnly)) {
    return { isValid: false, error: "Invalid dummy phone number" };
  }

  return { isValid: true, error: "" };
};

export const validateEmail = (email, isRequired = false) => {
  if (!email || !email.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Email address is required" };
    }
    return { isValid: true, error: "" }; // Optional
  }
  const clean = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { isValid: false, error: "Please enter a valid email address (e.g. name@domain.com)" };
  }
  return { isValid: true, error: "" };
};

export const validateRequiredText = (val, fieldName = "Field", minLen = 2) => {
  if (!val || !val.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (val.trim().length < minLen) {
    return { isValid: false, error: `${fieldName} must be at least ${minLen} characters` };
  }
  return { isValid: true, error: "" };
};

export const validatePositiveNumber = (val, fieldName = "Value") => {
  if (val === undefined || val === null || val === "") {
    return { isValid: false, error: `${fieldName} is required` };
  }
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number greater than 0` };
  }
  return { isValid: true, error: "" };
};

export const formatPhoneDisplay = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

// Check for Duplicate Lead in CRM (by Phone or Email)
export const checkDuplicateLead = (phone, email, currentLeadId = null, existingLeads = []) => {
  if (!existingLeads || existingLeads.length === 0) {
    // Also check localStorage if available
    try {
      const stored = localStorage.getItem("crm_leads_cache");
      if (stored) {
        existingLeads = JSON.parse(stored);
      }
    } catch (e) {}
  }

  const cleanInputPhone = (phone || "").replace(/\D/g, "").slice(-10);
  const cleanInputEmail = (email || "").trim().toLowerCase();

  for (const lead of existingLeads) {
    // Skip if comparing against the same lead in edit mode
    if (currentLeadId && (lead.id === currentLeadId || lead.name === currentLeadId)) {
      continue;
    }

    const leadPhone = (lead.phone || "").replace(/\D/g, "").slice(-10);
    const leadEmail = (lead.email || "").trim().toLowerCase();

    // Check matching 10-digit phone
    if (cleanInputPhone && cleanInputPhone.length === 10 && leadPhone === cleanInputPhone) {
      return {
        isDuplicate: true,
        field: "phone",
        existingLead: lead,
        error: `Duplicate Mobile: Lead '${lead.name}' (${lead.id || 'Existing'}) already registered with this phone number!`
      };
    }

    // Check matching email if email provided
    if (cleanInputEmail && leadEmail && leadEmail === cleanInputEmail && !cleanInputEmail.endsWith("@gmail.com")) {
      return {
        isDuplicate: true,
        field: "email",
        existingLead: lead,
        error: `Duplicate Email: Lead '${lead.name}' (${lead.id || 'Existing'}) already registered with this email address!`
      };
    }
  }

  return { isDuplicate: false, error: "" };
};
