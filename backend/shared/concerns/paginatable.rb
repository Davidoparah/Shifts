module Shared
  module Paginatable
    extend ActiveSupport::Concern

    included do
      def self.paginate(page: 1, per_page: 20)
        page = [page.to_i, 1].max
        per_page = [[per_page.to_i, 1].max, 100].min
        
        skip((page - 1) * per_page).limit(per_page)
      end
    end

    class_methods do
      def paginated_response(collection, page: 1, per_page: 20)
        page = [page.to_i, 1].max
        per_page = [[per_page.to_i, 1].max, 100].min
        total = collection.count

        {
          data: collection,
          meta: {
            current_page: page,
            per_page: per_page,
            total_pages: (total.to_f / per_page).ceil,
            total_count: total
          }
        }
      end
    end

    def paginate_params
      {
        page: params[:page] || 1,
        per_page: params[:per_page] || 20
      }
    end

    def render_paginated(collection, serializer: nil)
      paginated = collection.paginate(**paginate_params)
      data = serializer ? serializer.new(paginated).serialize : paginated

      render json: self.class.paginated_response(
        data,
        page: paginate_params[:page],
        per_page: paginate_params[:per_page]
      )
    end
  end
end 