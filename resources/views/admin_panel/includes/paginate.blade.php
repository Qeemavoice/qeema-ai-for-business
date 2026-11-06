<paginate v-if="page.totalItems>page.itemsPerPage"
          :click-handler="nextPage"
          ref="paginateTable"
          :next-text="'>'"
          :prev-text="'<'"
          :page-count="page.totalPages"
          :container-class="'pagination'"
          :next-class="'paginate_button page-item next'"
          :prev-class="'paginate_button page-item previous'"
          :next-link-class="'page-link'"
          :prev-link-class="'page-link'"
          :page-class="'paginate_button page-item'"
          :page-link-class="'page-link'">
</paginate>
