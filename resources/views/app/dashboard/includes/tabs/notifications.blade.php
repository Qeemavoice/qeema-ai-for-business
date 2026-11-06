<div class="tab-pane fade" id="notifications" role="tabpanel" aria-labelledby="notifications-tab">
  <notifications-index inline-template>
      <div class="card card-main" id="">
          <div class="card-header">
              <h4> إشعاراتي </h4>
          </div>
          <div class="card-body table-responsive">
              <table class="table table-hover">
                  <thead>
                  <tr>
                      <th scope="col">#</th>
                      <th scope="col"> العنوان</th>
                      <th scope="col"> التفاصيل</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="notification in notifications">
                      <th scope="row">@{{ notification.id }}</th>
                      <td>@{{ notification.title }}</td>
                      <td>@{{ notification.body }}</td>
                      <td>@{{ notification.created_at }}</td>
                  </tr>
                  </tbody>
              </table>

          </div>
      </div>
  </notifications-index>
</div>
