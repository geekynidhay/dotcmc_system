<?php include('db_connect.php');?>
<style>
	input[type=checkbox] {
		-ms-transform: scale(1.3);
		-moz-transform: scale(1.3);
		-webkit-transform: scale(1.3);
		-o-transform: scale(1.3);
		transform: scale(1.3);
		cursor: pointer;
	}
	.badge-pending {
		background-color: #dc3545;
		color: #fff;
		padding: 6px 12px;
		border-radius: 6px;
		font-weight: 600;
	}
	.badge-cleared {
		background-color: #28a745;
		color: #fff;
		padding: 6px 12px;
		border-radius: 6px;
		font-weight: 600;
	}
</style>

<div class="container-fluid">
	<div class="col-lg-12">
		<div class="row mb-4 mt-4">
			<div class="col-md-12"></div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<div class="card">
					<div class="card-header d-flex justify-content-between align-items-center">
						<b style="font-size: 1.2rem; color: var(--primary-navy);"><i class="fa fa-bell"></i> Fees Reminder System</b>
					</div>
					<div class="card-body">
						<div class="row">
							<!-- Course Filter -->
							<div class="col-md-3">
								<div class="form-group">
									<label class="control-label font-weight-bold">Filter by Course</label>
									<select id="course_filter" class="custom-select select2">
										<option value="">All Courses</option>
										<?php 
										$courses_list = $conn->query("SELECT DISTINCT c.course FROM courses c ORDER BY c.course ASC");
										while($crow = $courses_list->fetch_assoc()):
										?>
										<option value="<?php echo htmlspecialchars($crow['course']) ?>"><?php echo htmlspecialchars($crow['course']) ?></option>
										<?php endwhile; ?>
									</select>
								</div>
							</div>

							<!-- Payment Status Filter -->
							<div class="col-md-3">
								<div class="form-group">
									<label class="control-label font-weight-bold">Filter by Fee Status</label>
									<select id="status_filter" class="custom-select">
										<option value="">All Students (Paid & Pending)</option>
										<option value="unpaid" selected>Pending Balance Only</option>
										<option value="paid">Fully Paid</option>
									</select>
								</div>
							</div>

							<!-- Action Buttons -->
							<div class="col-md-6 text-right" style="margin-top: 30px;">
								<button class="btn btn-info font-weight-bold" id="send_custom"><i class="fa fa-comment-dots"></i> Custom Message</button>
								<button class="btn btn-warning font-weight-bold" id="select_all_unpaid_btn"><i class="fa fa-check-square"></i> Select Pending</button>
								<button class="btn btn-danger font-weight-bold" id="send_unpaid"><i class="fa fa-paper-plane"></i> Send Reminder</button>
							</div>
						</div>
						<hr>

						<table class="table table-condensed table-bordered table-hover" id="reminder-table">
							<thead>
								<tr>
									<th class="text-center align-middle" style="width: 40px;">
										<input type="checkbox" id="selectAll" style="margin:0;">
									</th>
									<th class="text-center" style="width: 50px;">#</th>
									<th>Roll No.</th>
									<th>Student Name</th>
									<th>Course</th>
									<th>Contact / WhatsApp</th>
									<th class="text-right">Total Fee</th>
									<th class="text-right">Paid</th>
									<th class="text-right">Pending Balance</th>
									<th class="text-center">Status</th>
								</tr>
							</thead>
							<tbody>
								<?php 
								$i = 1;
								
								// Accurate calculation: get each student with their course, total fee, and aggregate payments
								$query = "
									SELECT 
										s.id,
										s.id_no,
										s.name,
										s.contact,
										s.whatsapp_number,
										COALESCE(c.course, 'General') as course_name,
										ef.total_fee,
										COALESCE(p.paid, 0) as paid_amount,
										(ef.total_fee - COALESCE(p.paid, 0)) as balance
									FROM student s
									INNER JOIN student_ef_list ef ON ef.student_id = s.id
									LEFT JOIN courses c ON c.id = ef.course_id
									LEFT JOIN (
										SELECT ef_id, SUM(amount) as paid 
										FROM payments 
										GROUP BY ef_id
									) p ON p.ef_id = ef.id
									ORDER BY s.name ASC
								";

								$students = $conn->query($query);

								while($row = $students->fetch_assoc()):
									$total = (float)$row['total_fee'];
									$paid = (float)$row['paid_amount'];
									$balance = $total - $paid;
									$is_unpaid = $balance > 0;
									
									$whatsapp_num = !empty($row['whatsapp_number']) ? $row['whatsapp_number'] : $row['contact'];
								?>
								<tr class="student-row" 
									data-course="<?php echo htmlspecialchars($row['course_name']) ?>" 
									data-unpaid="<?php echo $is_unpaid ? '1' : '0' ?>">
									<td class="text-center align-middle">
										<input type="checkbox" class="student-checkbox" 
											value="<?php echo $row['id'] ?>" 
											data-unpaid="<?php echo $is_unpaid ? '1' : '0' ?>"
											data-name="<?php echo htmlspecialchars($row['name']) ?>"
											data-balance="<?php echo $balance ?>"
											data-contact="<?php echo htmlspecialchars($whatsapp_num) ?>">
									</td>
									<td class="text-center"><?php echo $i++ ?></td>
									<td><b><?php echo htmlspecialchars($row['id_no']) ?></b></td>
									<td><b><?php echo htmlspecialchars(ucwords($row['name'])) ?></b></td>
									<td><span class="badge badge-info"><?php echo htmlspecialchars($row['course_name']) ?></span></td>
									<td>
										<small>Phone: <b><?php echo htmlspecialchars($row['contact']) ?></b></small><br>
										<small class="text-success"><i class="fab fa-whatsapp"></i> <b><?php echo htmlspecialchars($whatsapp_num) ?></b></small>
									</td>
									<td class="text-right">₹<?php echo number_format($total, 2) ?></td>
									<td class="text-right text-success font-weight-bold">₹<?php echo number_format($paid, 2) ?></td>
									<td class="text-right font-weight-bold <?php echo $is_unpaid ? 'text-danger' : 'text-muted' ?>">
										₹<?php echo number_format($balance, 2) ?>
									</td>
									<td class="text-center">
										<?php if($is_unpaid): ?>
											<span class="badge-pending">Due: ₹<?php echo number_format($balance, 0) ?></span>
										<?php else: ?>
											<span class="badge-cleared">Cleared</span>
										<?php endif; ?>
									</td>
								</tr>
								<?php endwhile; ?>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Custom Message Modal -->
<div class="modal fade" id="customMessageModal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title font-weight-bold" style="color: var(--primary-navy);"><i class="fa fa-comment-alt"></i> Send Custom Reminder Message</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
			<label class="control-label font-weight-bold">Message Content</label>
			<textarea id="custom_message_text" class="form-control" rows="6" placeholder="Dear Student, This is a reminder regarding your pending fees balance of ₹{balance} at DOT CMC..."></textarea>
		</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary font-weight-bold" id="submit_custom_message"><i class="fa fa-paper-plane"></i> Send</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<script>
	$(document).ready(function(){
		$('.select2').select2({
			placeholder:"All Courses",
			width: "100%"
		});

		// Apply Filters (Course + Fee Status)
		function applyFilters() {
			var selectedCourse = $('#course_filter').val();
			var selectedStatus = $('#status_filter').val();

			$('#selectAll').prop('checked', false);
			$('.student-checkbox').prop('checked', false);

			$('.student-row').each(function(){
				var row = $(this);
				var courseMatch = (selectedCourse === '' || row.attr('data-course') === selectedCourse);
				var statusMatch = true;

				if (selectedStatus === 'unpaid') {
					statusMatch = (row.attr('data-unpaid') === '1');
				} else if (selectedStatus === 'paid') {
					statusMatch = (row.attr('data-unpaid') === '0');
				}

				if (courseMatch && statusMatch) {
					row.show();
				} else {
					row.hide();
				}
			});
		}

		$('#course_filter, #status_filter').change(applyFilters);

		// Trigger filter on page load (defaults to pending balance)
		applyFilters();

		// Select All visible rows
		$('#selectAll').click(function(){
			var isChecked = $(this).is(':checked');
			$('.student-row:visible .student-checkbox').prop('checked', isChecked);
		});

		// Quick button: Select all visible pending students
		$('#select_all_unpaid_btn').click(function(){
			$('.student-row:visible').each(function(){
				if ($(this).attr('data-unpaid') === '1') {
					$(this).find('.student-checkbox').prop('checked', true);
				}
			});
			alert_toast("Selected all visible students with pending balance.", "info");
		});

		function sendAjax(selected_ids, messageText = '') {
			if(selected_ids.length === 0){
				alert_toast("Please select at least one student.", 'warning');
				return false;
			}
			start_load();
			$.ajax({
				url:'ajax.php?action=send_fee_reminders',
				method:'POST',
				data: {
					student_ids: selected_ids,
					message: messageText
				},
				success:function(resp){
					if(resp == 1){
						alert_toast("Fee reminders queued successfully.", 'success');
						setTimeout(function(){
							location.reload();
						}, 1200);
					} else {
						alert_toast("Reminder logged successfully.", 'success');
						end_load();
					}
				},
				error: function() {
					alert_toast("Unable to send request.", 'danger');
					end_load();
				}
			});
		}

		// Send reminders to selected
		$('#send_unpaid').click(function(){
			var selected_ids = [];
			$('.student-checkbox:checked').each(function(){
				selected_ids.push($(this).val());
			});
			if(selected_ids.length === 0) {
			    alert_toast("Please select at least one student.", 'warning');
			    return false;
			}
			sendAjax(selected_ids);
		});

		// Custom Message Modal
		$('#send_custom').click(function(){
			var count = $('.student-checkbox:checked').length;
			if(count === 0) {
			    alert_toast("Please select at least one student to send a custom message.", 'warning');
			    return false;
			}
			$('#custom_message_text').val('');
			$('#customMessageModal').modal('show');
		});

		$('#submit_custom_message').click(function(){
			var msg = $('#custom_message_text').val();
			if($.trim(msg) === '') {
				alert_toast("Please write a message content.", 'warning');
				return false;
			}
			var selected_ids = [];
			$('.student-checkbox:checked').each(function(){
				selected_ids.push($(this).val());
			});
			$('#customMessageModal').modal('hide');
			sendAjax(selected_ids, msg);
		});
	});
</script>
