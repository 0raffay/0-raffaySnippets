class RFvalidateForm {
	constructor(
		{
			form = null,
			inputs = null,
			button = null,
			specialFields = "rfvalidation-regex",
			errorClass = "error",
			disableClass = "disabled",
			exclude = "exclude",
			validateCheckbox = true,
		},
		success
	) {
		if (!form) {
			console.error(
				"RfvalidateForm requires a form element. Please provide it's selector"
			);
			return;
		}
		this.form = document.querySelector(form);
		this.inputs = [];
		this.specialFields = [];
		this.button = this.setButton(button);
		this.errorClass = errorClass;
		this.disableClass = disableClass;
		this.success = success;
		this.exclude = exclude;
		this.validateCheckbox = validateCheckbox;
		this.checkboxes = [];

		this.form.setAttribute("novalidate", "true");

		if (!inputs) {
			this.setBasicInputs();
		} else {
			this.setUserInputs(inputs);
		}

		if (this.validateCheckbox) {
			this.setCheckbox();
		}

		if (specialFields) {
			this.setSpecialFields(specialFields);
		}

		this.valid = false;

		this.#addEventListeners();
	}

	checkIfChecked(checkbox) {
		if (checkbox) {
			if (!checkbox.checked) {
				this.addErrorClass(checkbox);
				this.setValid();
			} else {
				this.removeErrorClass(checkbox);
				this.setValid();
			}
			return;
		}

		if (!this.checkboxes || !this.checkboxes.length) {
			return;
		}
		this.checkboxes.forEach(checkbox => {
			if (!checkbox.checked) {
				this.addErrorClass(checkbox);
				this.setValid();
				return;
			}
			this.removeErrorClass(checkbox);
			this.setValid();
			return;
		})
	}

	setCheckbox() {
		const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));

		if (!checkboxes || !checkboxes.length) {
			return;
		}

		checkboxes.forEach(checkbox => {
			this.checkboxes.push(checkbox);
		});
	}


	#addEventListeners() {
		this.form.addEventListener("submit", (e) => {
			e.preventDefault();
			this.checkRegexValidity();
			this.checkIfEmpty();
			this.checkIfChecked();

			if (this.valid) {
				this.success(this.form);
			}
		});

		this.inputs.forEach((i) => {
			i.addEventListener("input", (e) => {
				this.checkIfEmpty(e.target);
			});
		});

		if (this.specialFields) {
			this.specialFields.forEach((s) => {
				s.input.addEventListener("input", (e) => {
					this.checkRegexValidity(s.input, s.regex);
				});
			});
		}

		if (this.checkboxes && this.checkboxes.length) {
			this.checkboxes.forEach(c => {
				c.addEventListener("input", (e) => {
					this.checkIfChecked(c);
				})
			})
		}
	}

	checkRegexValidity(input, regex) {
		if (input && regex) {
			const value = input.value;
			if (!regex.test(value)) {
				this.addErrorClass(input);
				this.setValid();
				return;
			}
			this.removeErrorClass(input);
			this.setValid();
			return;
		}

		this.specialFields.forEach((s) => {
			if (!s.regex.test(s.input.value)) {
				this.addErrorClass(s.input);
				this.setValid();
				return;
			}
			this.removeErrorClass(s.input);
			this.setValid();
		});
	}

	checkIfEmpty(input) {
		if (input) {
			if (input.value == "") {
				this.addErrorClass(input);
				this.setValid();
				return;
			}
			this.removeErrorClass(input);
			this.setValid();
			return;
		}

		this.inputs.forEach((i) => {
			if (i.value == "") {
				this.addErrorClass(i);
				this.setValid();
				return;
			}
			this.removeErrorClass(i);
			this.setValid();
			return;
		});
	}

	addErrorClass(input) {
		input.classList.add(this.errorClass);
	}

	removeErrorClass(input) {
		input.classList.remove(this.errorClass);
	}

	checkErrorClass(input) {
		return input.classList.contains(this.errorClass);
	}

	setValid() {
		const inputs = [
			...this.inputs,
			...this?.specialFields.map((i) => i.input),
			...this.checkboxes
		];

		const validityStatus = inputs.every((i) => {
			return !this.checkErrorClass(i);
		});
		this.valid = validityStatus;
	}

	setBasicInputs() {
		const inputs = this.form.querySelectorAll(
			"input[type='text'], input[type='email'], input[type='number'], input[type='tel'], input[type='date'], select, textarea, input[type='file'], input[type='password']"
		);
		inputs.forEach((i) => {
			const includeStatus = !i.classList.contains(this.exclude) &&
				!i.hasAttribute(this.exclude) &&
				!(i.type === "hidden");

			if (includeStatus) {
				this.inputs.push(i);
			}
		});
	}

	setUserInputs(inputSelector) {
		const inputs = this.form.querySelectorAll(inputSelector);
		inputs.forEach((i) => {
			this.inputs.push(i);
		});
	}

	setSpecialFields(specialFieldSelector) {
		const specialField = this.form.querySelectorAll(
			`[${specialFieldSelector}]`
		);
		if (specialField.length) {
			this.inputs.forEach((i) => {
				specialField.forEach((s) => {
					if (i == s) {
						this.inputs.splice(this.inputs.indexOf(i), 1);
					}
				});
			});
			specialField.forEach((s) => {
				const _s = {
					input: s,
					regex: new RegExp(s.getAttribute(specialFieldSelector)),
				};
				this.specialFields.push(_s);
			});
		}
	}

	setButton(buttonSelector) {
		return buttonSelector
			? this.form.querySelector(buttonSelector)
			: this.form.querySelector("button[type='submit']");
	}
}
const validate = new RFvalidateForm({ form: "#form" }, function () {
	alert("working peacefullyy");
});