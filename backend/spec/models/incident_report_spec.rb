require 'rails_helper'

RSpec.describe IncidentReport, type: :model do
  let(:user) { create(:user) }
  let(:shift) { create(:shift) }
  let(:valid_attributes) do
    {
      title: 'Security Incident',
      description: 'Unauthorized access attempt',
      severity: 'high',
      status: 'pending',
      shift: shift,
      reporter: user
    }
  end

  describe 'Mongoid configuration' do
    it { is_expected.to be_mongoid_document }
    it { is_expected.to have_mongoid_field(:title) }
    it { is_expected.to have_mongoid_field(:description) }
    it { is_expected.to have_mongoid_field(:severity) }
    it { is_expected.to have_mongoid_field(:status) }
    it { is_expected.to have_mongoid_field(:photo_urls) }
    it { is_expected.to have_mongoid_index_for(:shift_id) }
    it { is_expected.to have_mongoid_index_for(:reporter_id) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_presence_of(:severity) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_inclusion_of(:severity).in_array(%w[low medium high critical]) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[pending investigating resolved]) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:shift) }
    it { is_expected.to belong_to(:reporter).of_type(User) }
  end

  describe 'default values' do
    subject { described_class.new }

    it 'sets default status to pending' do
      expect(subject.status).to eq('pending')
    end

    it 'initializes photo_urls as empty array' do
      expect(subject.photo_urls).to eq([])
    end
  end

  describe 'scopes' do
    before do
      create(:incident_report, status: 'pending')
      create(:incident_report, status: 'investigating')
      create(:incident_report, status: 'resolved')
    end

    it 'returns pending incidents' do
      expect(described_class.pending.count).to eq(1)
    end

    it 'returns investigating incidents' do
      expect(described_class.investigating.count).to eq(1)
    end

    it 'returns resolved incidents' do
      expect(described_class.resolved.count).to eq(1)
    end
  end

  describe '#mark_as_investigating' do
    subject { create(:incident_report, status: 'pending') }

    it 'changes status to investigating' do
      subject.mark_as_investigating
      expect(subject.reload.status).to eq('investigating')
    end
  end

  describe '#resolve' do
    subject { create(:incident_report, status: 'investigating') }

    it 'changes status to resolved' do
      subject.resolve
      expect(subject.reload.status).to eq('resolved')
    end
  end

  describe 'photo management' do
    subject { create(:incident_report) }
    let(:photo_url) { 'http://example.com/photo.jpg' }

    describe '#add_photo' do
      it 'adds photo URL to the array' do
        subject.add_photo(photo_url)
        expect(subject.reload.photo_urls).to include(photo_url)
      end
    end

    describe '#remove_photo' do
      before { subject.add_photo(photo_url) }

      it 'removes photo URL from the array' do
        subject.remove_photo(photo_url)
        expect(subject.reload.photo_urls).not_to include(photo_url)
      end
    end
  end
end 