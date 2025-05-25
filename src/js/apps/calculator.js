/**
 * FlowCalculator App for Flowway TV OS
 * A macOS-style calculator
 */
const FlowCalculator = {
  appId: 'calculator',
  currentValue: '0',
  previousValue: null,
  operator: null,
  newNumber: true,
  memory: 0,
  
  /**
   * Initialize the app
   */
  init() {
    // Nothing to initialize
  },
  
  /**
   * Open the app
   */
  open() {
    // Check if window already exists
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }
    
    // Get content template
    const template = document.getElementById('calculator-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'Calculator', content, {
      width: 320,
      height: 480,
      resizable: false
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Update display
    this.updateDisplay();
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Number buttons
    const numberButtons = windowElement.querySelectorAll('.calc-btn[data-number]');
    numberButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.inputNumber(button.getAttribute('data-number'));
      });
    });
    
    // Operator buttons
    const operatorButtons = windowElement.querySelectorAll('.calc-btn[data-operator]');
    operatorButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.inputOperator(button.getAttribute('data-operator'));
      });
    });
    
    // Special function buttons
    const clearButton = windowElement.querySelector('.calc-btn[data-action="clear"]');
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clear());
    }
    
    const negateButton = windowElement.querySelector('.calc-btn[data-action="negate"]');
    if (negateButton) {
      negateButton.addEventListener('click', () => this.negate());
    }
    
    const percentButton = windowElement.querySelector('.calc-btn[data-action="percent"]');
    if (percentButton) {
      percentButton.addEventListener('click', () => this.percent());
    }
    
    const decimalButton = windowElement.querySelector('.calc-btn[data-action="decimal"]');
    if (decimalButton) {
      decimalButton.addEventListener('click', () => this.decimal());
    }
    
    const equalsButton = windowElement.querySelector('.calc-btn[data-action="equals"]');
    if (equalsButton) {
      equalsButton.addEventListener('click', () => this.calculate());
    }
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!FlowWindows.exists(this.appId)) return;
      
      if (e.key >= '0' && e.key <= '9') {
        this.inputNumber(e.key);
      } else if (e.key === '.') {
        this.decimal();
      } else if (e.key === '+') {
        this.inputOperator('+');
      } else if (e.key === '-') {
        this.inputOperator('-');
      } else if (e.key === '*') {
        this.inputOperator('×');
      } else if (e.key === '/') {
        this.inputOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        this.calculate();
      } else if (e.key === 'Escape') {
        this.clear();
      } else if (e.key === 'Backspace') {
        this.backspace();
      }
    });
  },
  
  /**
   * Update the calculator display
   */
  updateDisplay() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const display = window.querySelector('.calc-display');
    if (!display) return;
    
    // Format the display value
    let displayValue = this.currentValue;
    
    // Handle large numbers
    if (displayValue.length > 10) {
      const num = parseFloat(displayValue);
      if (Math.abs(num) >= 1e10) {
        displayValue = num.toExponential(6);
      } else {
        displayValue = num.toPrecision(10);
      }
    }
    
    // Remove trailing zeros after decimal
    if (displayValue.includes('.')) {
      displayValue = parseFloat(displayValue).toString();
    }
    
    display.textContent = displayValue;
  },
  
  /**
   * Input a number
   * @param {string} num - The number to input
   */
  inputNumber(num) {
    if (this.newNumber) {
      this.currentValue = num;
      this.newNumber = false;
    } else {
      // Limit to 10 digits
      if (this.currentValue.replace(/[.-]/g, '').length >= 10) return;
      
      this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
    }
    
    this.updateDisplay();
  },
  
  /**
   * Input an operator
   * @param {string} op - The operator to input
   */
  inputOperator(op) {
    this.calculate();
    this.previousValue = this.currentValue;
    this.operator = op;
    this.newNumber = true;
  },
  
  /**
   * Add decimal point
   */
  decimal() {
    if (this.newNumber) {
      this.currentValue = '0.';
      this.newNumber = false;
    } else if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
    
    this.updateDisplay();
  },
  
  /**
   * Negate the current value
   */
  negate() {
    this.currentValue = (parseFloat(this.currentValue) * -1).toString();
    this.updateDisplay();
  },
  
  /**
   * Convert to percentage
   */
  percent() {
    this.currentValue = (parseFloat(this.currentValue) / 100).toString();
    this.updateDisplay();
  },
  
  /**
   * Clear the calculator
   */
  clear() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.newNumber = true;
    this.updateDisplay();
  },
  
  /**
   * Remove last digit
   */
  backspace() {
    if (this.currentValue.length > 1) {
      this.currentValue = this.currentValue.slice(0, -1);
    } else {
      this.currentValue = '0';
    }
    this.updateDisplay();
  },
  
  /**
   * Perform calculation
   */
  calculate() {
    if (!this.operator || !this.previousValue) return;
    
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result;
    
    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '×':
        result = prev * current;
        break;
      case '÷':
        result = prev / current;
        break;
    }
    
    this.currentValue = result.toString();
    this.previousValue = null;
    this.operator = null;
    this.newNumber = true;
    
    this.updateDisplay();
  }
};