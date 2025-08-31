class AttendanceCalculator {
    constructor() {
        this.form = document.getElementById('attendanceForm');
        this.totalInput = document.getElementById('totalClasses');
        this.attendedInput = document.getElementById('attendedClasses');
        this.targetSelect = document.getElementById('targetPercentage');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.calculateText = document.getElementById('calculateText');
        this.errorAlert = document.getElementById('errorAlert');
        this.results = document.getElementById('results');
        this.livePreview = document.getElementById('livePreview');
        this.currentBadge = document.getElementById('currentBadge');
        this.targetText = document.getElementById('targetText');
        this.progressText = document.getElementById('progressText');
        this.progressFill = document.getElementById('progressFill');
        
        this.isCalculating = false;
        
        this.init();
    }
    
    init() {
        // Set current year
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.resetBtn.addEventListener('click', () => this.resetForm());
        
        // Input listeners for live preview
        [this.totalInput, this.attendedInput, this.targetSelect].forEach(input => {
            input.addEventListener('input', () => this.updateLivePreview());
            input.addEventListener('change', () => this.updateLivePreview());
        });
        
        // Initialize
        this.updateLivePreview();
    }
    
    validateInputs(total, attended) {
        const errors = [];
        
        if (!Number.isInteger(total) || !Number.isInteger(attended)) {
            errors.push('Please enter whole numbers for total and attended classes.');
        }
        if (total <= 0) {
            errors.push('Total classes must be greater than zero.');
        }
        if (attended < 0) {
            errors.push('Classes attended cannot be negative.');
        }
        if (attended > total) {
            errors.push('Classes attended cannot exceed total classes conducted.');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    calculateAttendance() {
        const total = parseInt(this.totalInput.value);
        const attended = parseInt(this.attendedInput.value);
        const target = parseInt(this.targetSelect.value);
        
        const { valid, errors } = this.validateInputs(total, attended);
        
        if (!valid) {
            this.showError(errors[0]);
            return;
        }
        
        this.clearError();
        this.setCalculating(true);
        
        // Simulate calculation delay for smooth animation
        setTimeout(() => {
            const currentPct = (attended / total) * 100;
            
            if (currentPct >= target) {
                // Calculate bunkable classes
                const bunkable = Math.floor((100 * attended - target * total) / target);
                const futureTotal = total + Math.max(0, bunkable);
                const futurePct = attended / futureTotal * 100;
                
                this.showSuccessResult({
                    currentPercentage: currentPct,
                    targetPercentage: target,
                    bunkableClasses: Math.max(0, bunkable),
                    futurePercentage: futurePct,
                    attended,
                    total
                });
            } else {
                // Calculate required classes
                const required = Math.ceil((target * total - 100 * attended) / (100 - target));
                const futureAttended = attended + required;
                const futureTotal = total + required;
                const futurePct = futureAttended / futureTotal * 100;
                
                this.showWarningResult({
                    currentPercentage: currentPct,
                    targetPercentage: target,
                    requiredClasses: Math.max(0, required),
                    futurePercentage: futurePct,
                    attended,
                    total
                });
            }
            
            this.setCalculating(false);
        }, 500);
    }
    
    showSuccessResult(result) {
        this.results.innerHTML = `
            <div class="result-card result-success animate-fade-in">
                <div class="result-header">
                    <svg class="icon" style="color: hsl(var(--accent));" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <h3 class="result-title success">You're On Track! 🎉</h3>
                </div>
                
                <div class="result-content">
                    <div class="result-section">
                        <h4>Current Status</h4>
                        <div class="result-item">
                            <span class="result-label">Attendance:</span>
                            <span class="result-value">${result.attended}/${result.total}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Current %:</span>
                            <span class="result-value">${result.currentPercentage.toFixed(2)}%</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Target %:</span>
                            <span class="result-value">${result.targetPercentage}%</span>
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h4>Recommendation</h4>
                        <div class="result-item">
                            <span class="result-label">Safe to skip:</span>
                            <span class="result-value" style="color: hsl(var(--accent));">${result.bunkableClasses} classes</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Future %:</span>
                            <span class="result-value" style="color: hsl(var(--accent));">${result.futurePercentage.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="result-summary success">
                    <p>Great job! You can afford to skip ${result.bunkableClasses} more class${result.bunkableClasses === 1 ? '' : 'es'} and still maintain your target attendance of ${result.targetPercentage}%.</p>
                </div>
            </div>
        `;
    }
    
    showWarningResult(result) {
        this.results.innerHTML = `
            <div class="result-card result-warning animate-fade-in">
                <div class="result-header">
                    <svg class="icon" style="color: hsl(var(--warning));" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <h3 class="result-title warning">Catch Up Required 📚</h3>
                </div>
                
                <div class="result-content">
                    <div class="result-section">
                        <h4>Current Status</h4>
                        <div class="result-item">
                            <span class="result-label">Attendance:</span>
                            <span class="result-value">${result.attended}/${result.total}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Current %:</span>
                            <span class="result-value">${result.currentPercentage.toFixed(2)}%</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Target %:</span>
                            <span class="result-value">${result.targetPercentage}%</span>
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h4>Recommendation</h4>
                        <div class="result-item">
                            <span class="result-label">Must attend:</span>
                            <span class="result-value" style="color: hsl(var(--warning));">${result.requiredClasses} classes</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Then you'll have:</span>
                            <span class="result-value" style="color: hsl(var(--warning));">${result.futurePercentage.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="result-summary warning">
                    <p>You need to attend the next ${result.requiredClasses} class${result.requiredClasses === 1 ? '' : 'es'} consecutively to reach your target of ${result.targetPercentage}%.</p>
                </div>
            </div>
        `;
    }
    
    updateLivePreview() {
        const total = this.totalInput.value ? parseInt(this.totalInput.value) : 0;
        const attended = this.attendedInput.value ? parseInt(this.attendedInput.value) : 0;
        const target = parseInt(this.targetSelect.value);
        
        if (total && attended !== '') {
            this.livePreview.style.display = 'block';
            
            const currentPercentage = total > 0 ? (attended / total) * 100 : 0;
            const isOnTarget = currentPercentage >= target;
            
            // Update badge
            this.currentBadge.textContent = `Current: ${currentPercentage.toFixed(1)}%`;
            this.currentBadge.className = `badge ${isOnTarget ? 'badge-success' : 'badge-warning'}`;
            
            // Update progress text
            this.targetText.textContent = target;
            this.progressText.textContent = `${currentPercentage.toFixed(1)}% / ${target}%`;
            
            // Update progress bar
            const progressWidth = Math.min(100, (currentPercentage / target) * 100);
            this.progressFill.style.width = `${progressWidth}%`;
            this.progressFill.className = `progress-fill ${isOnTarget ? 'progress-success' : 'progress-warning'}`;
        } else {
            this.livePreview.style.display = 'none';
        }
        
        // Update calculate button state
        const canCalculate = total && attended !== '' && target && total > 0 && attended >= 0;
        this.calculateBtn.disabled = !canCalculate || this.isCalculating;
    }
    
    setCalculating(calculating) {
        this.isCalculating = calculating;
        
        if (calculating) {
            this.calculateText.innerHTML = `
                <div class="spinner"></div>
                Calculating...
            `;
            this.calculateBtn.disabled = true;
        } else {
            this.calculateText.innerHTML = `
                <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm2 0a1 1 0 100 2h.01a1 1 0 100-2H11z" clip-rule="evenodd" />
                </svg>
                Calculate Attendance
            `;
            this.updateLivePreview();
        }
    }
    
    showError(message) {
        this.errorAlert.textContent = message;
        this.errorAlert.classList.add('show');
    }
    
    clearError() {
        this.errorAlert.classList.remove('show');
    }
    
    resetForm() {
        this.form.reset();
        this.targetSelect.value = '80';
        this.clearError();
        this.results.innerHTML = '';
        this.updateLivePreview();
        this.totalInput.focus();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        this.calculateAttendance();
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AttendanceCalculator();
});