require 'rails_helper'

RSpec.describe 'MongoDB Connection' do
  describe 'connection' do
    it 'successfully connects to MongoDB' do
      expect(Mongoid.default_client.command(ping: 1).ok?).to be true
    end

    it 'uses the test database' do
      expect(Mongoid.default_client.database.name).to end_with('test')
    end
  end

  describe 'indexes' do
    let(:models) do
      [
        IncidentReport,
        WorkerProfile,
        ChatMessage
      ]
    end

    it 'has created all indexes for models' do
      models.each do |model|
        indexes = model.collection.indexes.to_a
        expect(indexes.length).to be > 1 # At least _id index plus our custom indexes
      end
    end

    describe 'IncidentReport indexes' do
      let(:indexes) { IncidentReport.collection.indexes.to_a }

      it 'has required indexes' do
        index_keys = indexes.map { |i| i['key'].keys }.flatten
        expect(index_keys).to include('shift_id')
        expect(index_keys).to include('reporter_id')
        expect(index_keys).to include('status')
        expect(index_keys).to include('severity')
        expect(index_keys).to include('created_at')
      end
    end

    describe 'WorkerProfile indexes' do
      let(:indexes) { WorkerProfile.collection.indexes.to_a }

      it 'has required indexes' do
        index_keys = indexes.map { |i| i['key'].keys }.flatten
        expect(index_keys).to include('user_id')
        expect(index_keys).to include('skills')
        expect(index_keys).to include('hourly_rate')
        expect(index_keys).to include('rating')
      end
    end

    describe 'ChatMessage indexes' do
      let(:indexes) { ChatMessage.collection.indexes.to_a }

      it 'has required indexes' do
        index_keys = indexes.map { |i| i['key'].keys }.flatten
        expect(index_keys).to include('shift_id')
        expect(index_keys).to include('sender_id')
        expect(index_keys).to include('recipient_id')
        expect(index_keys).to include('created_at')
        expect(index_keys).to include('read')
      end
    end
  end

  describe 'data persistence' do
    it 'successfully saves and retrieves documents' do
      # Test IncidentReport
      incident = create(:incident_report)
      expect(IncidentReport.find(incident.id)).to eq(incident)

      # Test WorkerProfile
      profile = create(:worker_profile)
      expect(WorkerProfile.find(profile.id)).to eq(profile)

      # Test ChatMessage
      message = create(:chat_message)
      expect(ChatMessage.find(message.id)).to eq(message)
    end
  end
end 