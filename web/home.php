<?php include 'db_connect.php'; 

// Fetch basic stats
$students = $conn->query("SELECT * FROM student")->num_rows;
$total_payments = $conn->query("SELECT sum(amount) as total FROM payments")->fetch_array()['total'];
$today = date('Y-m-d');
$today_payments = $conn->query("SELECT sum(amount) as total FROM payments WHERE date(date_created) = '$today'")->fetch_array()['total'];

// Fetch breakdown for today
$breakdown = $conn->query("SELECT mode, sum(amount) as total FROM payments WHERE date(date_created) = '$today' GROUP BY mode");
$upi = 0;
$cash = 0;
while($row = $breakdown->fetch_assoc()){
    if(strtolower($row['mode']) == 'upi') $upi = $row['total'];
    else $cash += $row['total']; // Default to cash for others/null
}
$today_payments = $today_payments > 0 ? $today_payments : 0;
$total_payments = $total_payments > 0 ? $total_payments : 0;

$upi_percent = $today_payments > 0 ? ($upi / $today_payments) * 100 : 0;
$cash_percent = $today_payments > 0 ? ($cash / $today_payments) * 100 : 0;
?>

<div class="container-fluid mt-4">
    <div class="row">
        <div class="col-md-8 mb-4">
            <h4 style="color: var(--primary-navy); font-weight: 600;">Dashboard</h4>
            <span class="text-muted">Welcome back, <?php echo $_SESSION['login_name']; ?>! Here's what's happening today.</span>
        </div>
        <div class="col-md-4 mb-4 text-right">
            <button class="btn btn-primary font-weight-bold shadow-sm" id="btn_open_otp_modal" style="padding: 10px 20px; font-size: 1.05rem; border-radius: 8px;">
                <i class="fa fa-mobile-alt mr-2"></i> Generate Student App OTP
            </button>
        </div>
    </div>

    <div class="row mb-4">
        <!-- KPI Card 1 -->
        <div class="col-md-4 mb-3">
            <div class="card kpi-card h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="kpi-title mb-1">Total Students</div>
                            <div class="kpi-value"><?php echo number_format($students); ?></div>
                        </div>
                        <div class="col-auto">
                            <i class="fa fa-users fa-2x text-muted" style="opacity: 0.3;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- KPI Card 2 -->
        <div class="col-md-4 mb-3">
            <div class="card kpi-card h-100 py-2" style="border-left-color: #1cc88a !important;">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="kpi-title mb-1">Total Payments (All Time)</div>
                            <div class="kpi-value">₹<?php echo number_format($total_payments, 2); ?></div>
                        </div>
                        <div class="col-auto">
                            <i class="fa fa-money-check fa-2x text-muted" style="opacity: 0.3;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- KPI Card 3 -->
        <div class="col-md-4 mb-3">
            <div class="card kpi-card h-100 py-2" style="border-left-color: #f6c23e !important;">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="kpi-title mb-1">Today's Collection</div>
                            <div class="kpi-value">₹<?php echo number_format($today_payments, 2); ?></div>
                        </div>
                        <div class="col-auto">
                            <i class="fa fa-calendar-day fa-2x text-muted" style="opacity: 0.3;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <!-- Today's Payment Breakdown -->
        <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold" style="color: var(--primary-navy);">Today's Collection Breakdown</h6>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span style="font-size: 1.2rem; font-weight: 600;">UPI</span>
                        <span style="font-size: 1.2rem; font-weight: 700; color: var(--primary-navy);">₹<?php echo number_format($upi, 2); ?></span>
                    </div>
                    <div class="progress mb-4" style="height: 25px; border-radius: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: <?php echo $upi_percent; ?>%; background-color: var(--primary-navy);" aria-valuenow="<?php echo $upi_percent; ?>" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span style="font-size: 1.2rem; font-weight: 600;">Cash</span>
                        <span style="font-size: 1.2rem; font-weight: 700; color: #1cc88a;">₹<?php echo number_format($cash, 2); ?></span>
                    </div>
                    <div class="progress mb-4" style="height: 25px; border-radius: 5px;">
                        <div class="progress-bar" role="progressbar" style="width: <?php echo $cash_percent; ?>%; background-color: #1cc88a;" aria-valuenow="<?php echo $cash_percent; ?>" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <?php if($today_payments == 0): ?>
                        <div class="text-center text-muted mt-4">
                            <i class="fa fa-box-open fa-3x mb-3" style="color: #cbd5e1;"></i>
                            <p style="font-size: 1.2rem; font-weight: 500;">No payments recorded today yet.</p>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Student App OTP Generator Modal -->
<div class="modal fade" id="otpGeneratorModal" tabindex="-1" role="dialog" aria-hidden="true">
  <div class="modal-dialog modal-md modal-dialog-centered" role="document">
    <div class="modal-content" style="border-radius: 14px;">
      <div class="modal-header" style="background: var(--primary-navy); color: white; border-top-left-radius: 14px; border-top-right-radius: 14px;">
        <h5 class="modal-title font-weight-bold"><i class="fa fa-mobile-alt mr-2"></i> Student App Login OTP</h5>
        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body p-4">
        <div class="form-group mb-3">
          <label class="control-label font-weight-bold">Select Student:</label>
          <select id="otp_student_id" class="custom-select select2" style="width: 100%;">
            <option value="">-- Search by Name or Roll No --</option>
            <?php 
            $stds_query = $conn->query("
              SELECT s.id, s.id_no, s.name, ef.id as ef_id, ef.ef_no, c.course 
              FROM student s 
              INNER JOIN student_ef_list ef ON ef.student_id = s.id 
              LEFT JOIN courses c ON c.id = ef.course_id 
              ORDER BY s.name ASC
            ");
            while($st = $stds_query->fetch_assoc()):
            ?>
              <option value="<?php echo $st['id'] ?>" data-efid="<?php echo $st['ef_id'] ?>">
                <?php echo htmlspecialchars($st['name']) ?> (Roll: <?php echo htmlspecialchars($st['id_no']) ?> | Ledger: <?php echo htmlspecialchars($st['ef_no']) ?>)
              </option>
            <?php endwhile; ?>
          </select>
        </div>

        <div id="otp_display_box" class="text-center p-4 mt-3" style="display: none; background: #f8fafc; border: 2px dashed #3b82f6; border-radius: 12px;">
          <p class="text-muted mb-1 font-weight-bold" style="letter-spacing: 0.05em;">TELL STUDENT THIS 4-DIGIT CODE:</p>
          <div id="otp_digits" style="font-size: 3.2rem; font-weight: 900; letter-spacing: 8px; color: #1e3a8a;">----</div>
          <div class="mt-2">
            <span class="badge badge-warning" style="font-size: 0.95rem; padding: 6px 14px;">
              <i class="fa fa-clock mr-1"></i> Expires in: <b id="otp_countdown">30</b>s
            </span>
          </div>
          <p class="small text-muted mt-2 mb-0">Code changes each generation & is destroyed immediately upon entry.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary font-weight-bold" id="btn_generate_otp" style="padding: 8px 24px;">
          <i class="fa fa-key mr-1"></i> Generate 4-Digit OTP
        </button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<script>
$(document).ready(function(){
  $('#btn_open_otp_modal').click(function(){
    $('#otp_display_box').hide();
    $('#otpGeneratorModal').modal('show');
  });

  var otpTimer = null;

  $('#btn_generate_otp').click(function(){
    var student_id = $('#otp_student_id').val();
    if(!student_id){
      alert_toast("Please select a student first.", "warning");
      return;
    }

    var ef_id = $('#otp_student_id option:selected').attr('data-efid') || 0;

    start_load();
    $.ajax({
      url: 'ajax.php?action=generate_student_otp',
      method: 'POST',
      data: { student_id: student_id, ef_id: ef_id },
      success: function(resp){
        end_load();
        try {
          var res = JSON.parse(resp);
          if(res.status == 1){
            $('#otp_digits').text(res.otp);
            $('#otp_display_box').slideDown();

            var timeLeft = 30;
            $('#otp_countdown').text(timeLeft);
            if(otpTimer) clearInterval(otpTimer);

            otpTimer = setInterval(function(){
              timeLeft--;
              $('#otp_countdown').text(timeLeft);
              if(timeLeft <= 0){
                clearInterval(otpTimer);
                $('#otp_digits').text('EXPIRED');
                $('#otp_countdown').text('0');
              }
            }, 1000);
          } else {
            alert_toast(res.msg || "Error generating OTP", "danger");
          }
        } catch(e){
          alert_toast("Server response error", "danger");
        }
      },
      error: function(){
        end_load();
        alert_toast("Network error occurred", "danger");
      }
    });
  });

  $('#otpGeneratorModal').on('hidden.bs.modal', function(){
    if(otpTimer) clearInterval(otpTimer);
  });
});
</script>
